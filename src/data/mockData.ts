export interface Concept {
  id: string;
  name: string;
  subject: string;
  retention: number; // 0-100
  lastReviewed: string;
  nextReview: string;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
  status: "strong" | "fading" | "critical";
}

export interface ForgettingPoint {
  day: number;
  retention: number;
  withReview: number;
}

export const forgettingCurveData: ForgettingPoint[] = [
  { day: 0, retention: 100, withReview: 100 },
  { day: 1, retention: 58, withReview: 95 },
  { day: 2, retention: 44, withReview: 92 },
  { day: 3, retention: 36, withReview: 90 },
  { day: 5, retention: 28, withReview: 88 },
  { day: 7, retention: 25, withReview: 85 },
  { day: 10, retention: 21, withReview: 82 },
  { day: 14, retention: 18, withReview: 80 },
  { day: 21, retention: 15, withReview: 78 },
  { day: 30, retention: 12, withReview: 75 },
];

export const concepts: Concept[] = [
  {
    id: "1",
    name: "Binary Search Trees",
    subject: "Data Structures",
    retention: 92,
    lastReviewed: "2 hours ago",
    nextReview: "Tomorrow",
    reviewCount: 5,
    difficulty: "medium",
    status: "strong",
  },
  {
    id: "2",
    name: "Newton's Laws of Motion",
    subject: "Physics",
    retention: 64,
    lastReviewed: "3 days ago",
    nextReview: "Today",
    reviewCount: 3,
    difficulty: "easy",
    status: "fading",
  },
  {
    id: "3",
    name: "Integration by Parts",
    subject: "Calculus",
    retention: 31,
    lastReviewed: "1 week ago",
    nextReview: "Overdue",
    reviewCount: 2,
    difficulty: "hard",
    status: "critical",
  },
  {
    id: "4",
    name: "SQL Joins",
    subject: "Databases",
    retention: 85,
    lastReviewed: "1 day ago",
    nextReview: "In 3 days",
    reviewCount: 4,
    difficulty: "medium",
    status: "strong",
  },
  {
    id: "5",
    name: "Photosynthesis",
    subject: "Biology",
    retention: 47,
    lastReviewed: "5 days ago",
    nextReview: "Today",
    reviewCount: 2,
    difficulty: "easy",
    status: "fading",
  },
  {
    id: "6",
    name: "Fourier Transform",
    subject: "Signal Processing",
    retention: 19,
    lastReviewed: "2 weeks ago",
    nextReview: "Overdue",
    reviewCount: 1,
    difficulty: "hard",
    status: "critical",
  },
];

export const stats = {
  totalConcepts: 24,
  avgRetention: 62,
  conceptsToReview: 8,
  streakDays: 12,
};
