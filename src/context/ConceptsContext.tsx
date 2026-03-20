import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Call the ML backend via edge function to predict forgetting probability
async function fetchMLPrediction(concept: string, difficulty: string, timeGap: number): Promise<number | null> {
  try {
    const { data, error } = await supabase.functions.invoke("predict-forgetting", {
      body: { concept, difficulty, time_gap: timeGap },
    });
    if (error) {
      console.warn("ML prediction failed, using local fallback:", error);
      return null;
    }
    // Expect the API to return a forgetting probability (0-100 or 0-1)
    const prob = data?.forgetting_probability ?? data?.prediction ?? data?.probability ?? null;
    if (prob === null || prob === undefined) return null;
    // Normalize: if value is between 0-1, convert to percentage
    return prob <= 1 ? Math.round(prob * 100) : Math.round(prob);
  } catch (err) {
    console.warn("ML prediction request failed:", err);
    return null;
  }
}

export interface Concept {
  id: string;
  name: string;
  subject: string;
  retention: number;
  lastReviewed: string;
  nextReview: string;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
  status: "strong" | "fading" | "critical";
  daysSinceReview?: number;
  forgettingProbability?: number;
}

interface ConceptsContextType {
  concepts: Concept[];
  loading: boolean;
  addConcept: (concept: Omit<Concept, "id" | "retention" | "lastReviewed" | "nextReview" | "reviewCount" | "status">) => Promise<void>;
  deleteConcept: (id: string) => Promise<void>;
  markReviewed: (id: string) => Promise<void>;
  updateRetentionFromQuiz: (conceptId: string, correct: number, total: number) => Promise<void>;
}

const ConceptsContext = createContext<ConceptsContextType | null>(null);

export const useConcepts = () => {
  const ctx = useContext(ConceptsContext);
  if (!ctx) throw new Error("useConcepts must be used within ConceptsProvider");
  return ctx;
};

// Compute human-readable next review from a UTC timestamp
function formatNextReview(nextReviewAt: string): string {
  const now = new Date();
  const next = new Date(nextReviewAt);
  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 3) return "In 3 days";
  return `In ${diffDays} days`;
}

function formatLastReviewed(lastReviewedAt: string): string {
  const now = new Date();
  const last = new Date(lastReviewedAt);
  const diffMs = now.getTime() - last.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function daysSince(dateStr: string): number {
  const now = new Date();
  const then = new Date(dateStr);
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)));
}

// Local ML forgetting probability using Ebbinghaus model
// probability = e^(-days / stability) where stability depends on difficulty & reviews
function calcForgettingProbability(
  retention: number,
  difficulty: string,
  daysSinceReview: number,
): number {
  const stabilityMap = { easy: 14, medium: 7, hard: 3 };
  const stability = stabilityMap[difficulty as keyof typeof stabilityMap] ?? 7;
  const decayRate = Math.exp(-daysSinceReview / stability);
  const predicted = Math.round(retention * decayRate);
  return Math.max(0, Math.min(100, 100 - predicted));
}

function mapRow(row: Record<string, unknown>): Concept {
  const days = daysSince(row.last_reviewed_at as string);
  const fp = calcForgettingProbability(row.retention as number, row.difficulty as string, days);
  return {
    id: row.id as string,
    name: row.name as string,
    subject: row.subject as string,
    retention: row.retention as number,
    lastReviewed: formatLastReviewed(row.last_reviewed_at as string),
    nextReview: formatNextReview(row.next_review_at as string),
    reviewCount: row.review_count as number,
    difficulty: row.difficulty as "easy" | "medium" | "hard",
    status: row.status as "strong" | "fading" | "critical",
    daysSinceReview: days,
    forgettingProbability: fp,
  };
}

export const ConceptsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConcepts = useCallback(async () => {
    if (!user) { setConcepts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("concepts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load concepts"); console.error(error); }
    else {
      const mapped = (data ?? []).map(mapRow);
      setConcepts(mapped);
      // Fetch ML predictions asynchronously and update
      Promise.all(
        mapped.map(async (c) => {
          const mlProb = await fetchMLPrediction(c.name, c.difficulty, c.daysSinceReview ?? 0);
          return { id: c.id, mlProb };
        })
      ).then((results) => {
        setConcepts((prev) =>
          prev.map((c) => {
            const r = results.find((x) => x.id === c.id);
            return r?.mlProb !== null && r?.mlProb !== undefined
              ? { ...c, forgettingProbability: r.mlProb }
              : c;
          })
        );
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConcepts(); }, [fetchConcepts]);

  const addConcept = useCallback(async (
    input: Omit<Concept, "id" | "retention" | "lastReviewed" | "nextReview" | "reviewCount" | "status">
  ) => {
    if (!user) return;
    const { error } = await supabase.from("concepts").insert({
      user_id: user.id,
      name: input.name,
      subject: input.subject,
      difficulty: input.difficulty,
      retention: 100,
      review_count: 0,
      status: "strong",
      last_reviewed_at: new Date().toISOString(),
      next_review_at: new Date(Date.now() + 86400000).toISOString(),
    });
    if (error) { toast.error("Failed to add concept"); console.error(error); return; }
    toast.success("Concept added!");
    await fetchConcepts();
  }, [user, fetchConcepts]);

  const deleteConcept = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("concepts").delete().eq("id", id).eq("user_id", user.id);
    if (error) { toast.error("Failed to delete concept"); return; }
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Concept deleted");
  }, [user]);

  const markReviewed = useCallback(async (id: string) => {
    if (!user) return;
    const concept = concepts.find((c) => c.id === id);
    if (!concept) return;
    const newRetention = Math.min(100, concept.retention + 15);
    const newStatus = newRetention >= 70 ? "strong" : "fading";
    const nextAt = new Date(Date.now() + 86400000).toISOString();
    const now = new Date().toISOString();

    const { error } = await supabase.from("concepts").update({
      retention: newRetention,
      status: newStatus,
      review_count: concept.reviewCount + 1,
      last_reviewed_at: now,
      next_review_at: nextAt,
    }).eq("id", id).eq("user_id", user.id);

    if (error) { toast.error("Failed to mark reviewed"); return; }

    // Log review history
    await supabase.from("review_history").insert({
      user_id: user.id,
      concept_id: id,
      retention_before: concept.retention,
      retention_after: newRetention,
    });

    toast.success("Marked as reviewed!");
    await fetchConcepts();
  }, [user, concepts, fetchConcepts]);

  const updateRetentionFromQuiz = useCallback(async (conceptId: string, correct: number, total: number) => {
    if (!user) return;
    const concept = concepts.find((c) => c.id === conceptId);
    if (!concept) return;
    const score = total > 0 ? correct / total : 0;
    const newRetention = Math.max(0, Math.min(100, Math.round(concept.retention * 0.4 + score * 100 * 0.6)));
    const newStatus: Concept["status"] = newRetention >= 70 ? "strong" : newRetention >= 40 ? "fading" : "critical";
    const nextDays = newRetention >= 80 ? 3 : newRetention >= 50 ? 1 : 0;
    const nextAt = new Date(Date.now() + nextDays * 86400000).toISOString();
    const now = new Date().toISOString();

    const { error } = await supabase.from("concepts").update({
      retention: newRetention,
      status: newStatus,
      review_count: concept.reviewCount + 1,
      last_reviewed_at: now,
      next_review_at: nextAt,
    }).eq("id", conceptId).eq("user_id", user.id);

    if (error) { toast.error("Failed to update retention"); return; }

    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      concept_id: conceptId,
      correct_answers: correct,
      total_questions: total,
    });

    await fetchConcepts();
  }, [user, concepts, fetchConcepts]);

  return (
    <ConceptsContext.Provider value={{ concepts, loading, addConcept, deleteConcept, markReviewed, updateRetentionFromQuiz }}>
      {children}
    </ConceptsContext.Provider>
  );
};
