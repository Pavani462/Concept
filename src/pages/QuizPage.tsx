import { useState, useMemo } from "react";
import { useConcepts } from "@/context/ConceptsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronRight, RotateCcw, CheckCircle2, XCircle, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

type QuizState = "select" | "loading" | "in-progress" | "result";

interface QuizResult {
  conceptId: string;
  conceptName: string;
  total: number;
  correct: number;
}

async function fetchAIQuestions(conceptName: string, subject: string, difficulty: string, conceptId: string): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-quiz", {
      body: { conceptName, subject, difficulty, numQuestions: 3 },
    });
    if (error || !data?.questions) throw new Error(error?.message || "No questions returned");
    return data.questions.map((q: any, i: number) => ({
      id: `ai-${conceptId}-${i}`,
      conceptId,
      conceptName,
      subject,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    }));
  } catch (err) {
    console.error("AI quiz generation failed:", err);
    return [];
  }
}

const QuizPage = () => {
  const { concepts, updateRetentionFromQuiz } = useConcepts();
  const navigate = useNavigate();

  const [state, setState] = useState<QuizState>("select");
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<Record<string, { correct: number; total: number }>>({});

  const toggleConcept = (id: string) => {
    setSelectedConceptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const startQuiz = async () => {
    setState("loading");
    try {
      const allQuestions: QuizQuestion[] = [];
      const fetchPromises = selectedConceptIds.map((cId) => {
        const concept = concepts.find((c) => c.id === cId);
        if (!concept) return Promise.resolve([]);
        return fetchAIQuestions(concept.name, concept.subject, concept.difficulty, cId);
      });
      const results = await Promise.all(fetchPromises);
      results.forEach((qs) => allQuestions.push(...qs));

      if (allQuestions.length === 0) {
        toast.error("Failed to generate questions. Please try again.");
        setState("select");
        return;
      }

      // Shuffle
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      setQuestions(allQuestions);
      setCurrentIdx(0);
      setResults({});
      setSelectedOption(null);
      setAnswered(false);
      setState("in-progress");
    } catch {
      toast.error("Something went wrong generating the quiz.");
      setState("select");
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);

    const q = questions[currentIdx];
    const isCorrect = optionIdx === q.correctIndex;

    setResults((prev) => {
      const existing = prev[q.conceptId] || { correct: 0, total: 0 };
      return {
        ...prev,
        [q.conceptId]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total: existing.total + 1,
        },
      };
    });
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      Object.entries(results).forEach(([conceptId, r]) => {
        updateRetentionFromQuiz(conceptId, r.correct, r.total);
      });
      setState("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  };

  const finalResults: QuizResult[] = useMemo(
    () =>
      Object.entries(results).map(([conceptId, r]) => ({
        conceptId,
        conceptName: concepts.find((c) => c.id === conceptId)?.name || "Unknown",
        ...r,
      })),
    [results, concepts],
  );

  const totalCorrect = finalResults.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = finalResults.reduce((s, r) => s + r.total, 0);
  const scorePercent = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // LOADING
  if (state === "loading") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Generating AI questions for your topics...</p>
      </div>
    );
  }

  // SELECT concepts
  if (state === "select") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Quiz</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select concepts — AI will generate real questions for you
            </p>
          </div>
        </div>

        {concepts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No concepts yet. Add some first!</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/concepts")}>
              Go to Concepts
            </Button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              {concepts.map((c) => {
                const selected = selectedConceptIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleConcept(c.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 card-shadow ${
                      selected
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card border-2 border-transparent hover:card-shadow-hover"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.subject} • {c.retention}% retained</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedConceptIds.length} concept{selectedConceptIds.length !== 1 ? "s" : ""} selected
              </p>
              <Button onClick={startQuiz} disabled={selectedConceptIds.length === 0} className="gap-2">
                Start Quiz
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // IN-PROGRESS
  if (state === "in-progress" && questions.length > 0) {
    const q = questions[currentIdx];
    const isCorrect = selectedOption === q.correctIndex;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">{q.subject}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-xl bg-card p-6 card-shadow space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{q.conceptName}</p>
            <h2 className="text-lg font-display font-semibold text-foreground">{q.question}</h2>
          </div>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              let optionStyle = "bg-muted/50 hover:bg-muted border-transparent";
              if (answered) {
                if (i === q.correctIndex) {
                  optionStyle = "bg-success/10 border-success text-success";
                } else if (i === selectedOption && !isCorrect) {
                  optionStyle = "bg-danger/10 border-danger text-danger";
                } else {
                  optionStyle = "bg-muted/30 border-transparent opacity-50";
                }
              } else if (selectedOption === i) {
                optionStyle = "bg-primary/10 border-primary";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-xs font-semibold shrink-0 border border-border">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                    {answered && i === q.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 ml-auto text-success" />
                    )}
                    {answered && i === selectedOption && !isCorrect && i !== q.correctIndex && (
                      <XCircle className="w-5 h-5 ml-auto text-danger" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="flex justify-end pt-2">
              <Button onClick={nextQuestion} className="gap-2">
                {currentIdx + 1 >= questions.length ? "See Results" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-xl bg-card p-8 card-shadow text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          scorePercent >= 70 ? "bg-success/10" : scorePercent >= 40 ? "bg-accent/10" : "bg-danger/10"
        }`}>
          <Trophy className={`w-8 h-8 ${
            scorePercent >= 70 ? "text-success" : scorePercent >= 40 ? "text-accent" : "text-danger"
          }`} />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">{scorePercent}%</h1>
        <p className="text-muted-foreground">
          You got {totalCorrect} out of {totalQuestions} correct
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Concept Breakdown</h2>
        {finalResults.map((r) => {
          const pct = Math.round((r.correct / r.total) * 100);
          return (
            <div key={r.conceptId} className="rounded-xl bg-card p-4 card-shadow flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{r.conceptName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.correct}/{r.total} correct
                </p>
              </div>
              <span className={`text-sm font-bold ${
                pct >= 70 ? "text-success" : pct >= 40 ? "text-accent-foreground" : "text-danger"
              }`}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={() => { setState("select"); setSelectedConceptIds([]); }} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Quiz
        </Button>
        <Button onClick={() => navigate("/concepts")} className="gap-2">
          View Concepts
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizPage;
