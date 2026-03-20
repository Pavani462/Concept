export interface QuizQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// Pre-built questions mapped to mock concept IDs
const questionBank: Record<string, QuizQuestion[]> = {
  "1": [
    {
      id: "q1a",
      conceptId: "1",
      conceptName: "Binary Search Trees",
      subject: "Data Structures",
      question: "What is the worst-case time complexity of searching in an unbalanced BST?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 2,
    },
    {
      id: "q1b",
      conceptId: "1",
      conceptName: "Binary Search Trees",
      subject: "Data Structures",
      question: "In a BST, where is the minimum value located?",
      options: ["Root node", "Leftmost node", "Rightmost node", "Any leaf node"],
      correctIndex: 1,
    },
  ],
  "2": [
    {
      id: "q2a",
      conceptId: "2",
      conceptName: "Newton's Laws of Motion",
      subject: "Physics",
      question: "Newton's First Law is also known as the law of:",
      options: ["Acceleration", "Inertia", "Gravity", "Momentum"],
      correctIndex: 1,
    },
    {
      id: "q2b",
      conceptId: "2",
      conceptName: "Newton's Laws of Motion",
      subject: "Physics",
      question: "According to F = ma, if mass doubles and force stays the same, acceleration:",
      options: ["Doubles", "Halves", "Stays the same", "Quadruples"],
      correctIndex: 1,
    },
  ],
  "3": [
    {
      id: "q3a",
      conceptId: "3",
      conceptName: "Integration by Parts",
      subject: "Calculus",
      question: "The integration by parts formula is derived from which rule?",
      options: ["Chain rule", "Product rule", "Quotient rule", "Power rule"],
      correctIndex: 1,
    },
    {
      id: "q3b",
      conceptId: "3",
      conceptName: "Integration by Parts",
      subject: "Calculus",
      question: "In ∫u dv = uv − ∫v du, what should 'u' typically be chosen as?",
      options: ["Easiest to integrate", "Easiest to differentiate", "The constant", "The exponential"],
      correctIndex: 1,
    },
  ],
  "4": [
    {
      id: "q4a",
      conceptId: "4",
      conceptName: "SQL Joins",
      subject: "Databases",
      question: "Which JOIN returns only matching rows from both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"],
      correctIndex: 2,
    },
    {
      id: "q4b",
      conceptId: "4",
      conceptName: "SQL Joins",
      subject: "Databases",
      question: "A LEFT JOIN returns all rows from which table?",
      options: ["Right table", "Left table", "Both tables", "Neither"],
      correctIndex: 1,
    },
  ],
  "5": [
    {
      id: "q5a",
      conceptId: "5",
      conceptName: "Photosynthesis",
      subject: "Biology",
      question: "What is the primary pigment involved in photosynthesis?",
      options: ["Carotene", "Chlorophyll", "Xanthophyll", "Melanin"],
      correctIndex: 1,
    },
    {
      id: "q5b",
      conceptId: "5",
      conceptName: "Photosynthesis",
      subject: "Biology",
      question: "Where do the light reactions of photosynthesis occur?",
      options: ["Stroma", "Cytoplasm", "Thylakoid membrane", "Cell wall"],
      correctIndex: 2,
    },
  ],
  "6": [
    {
      id: "q6a",
      conceptId: "6",
      conceptName: "Fourier Transform",
      subject: "Signal Processing",
      question: "The Fourier Transform converts a signal from the time domain to the:",
      options: ["Spatial domain", "Frequency domain", "Laplace domain", "Z domain"],
      correctIndex: 1,
    },
    {
      id: "q6b",
      conceptId: "6",
      conceptName: "Fourier Transform",
      subject: "Signal Processing",
      question: "The inverse Fourier Transform converts from frequency domain back to:",
      options: ["Spatial domain", "Time domain", "Complex domain", "S-plane"],
      correctIndex: 1,
    },
  ],
};

// Generic fallback questions for user-added concepts
const genericQuestions = [
  "Can you recall the fundamental definition of this concept?",
  "What are the key components or steps involved in this concept?",
  "How does this concept relate to other topics in the same subject?",
  "Can you explain this concept in your own words?",
];

export function getQuestionsForConcept(conceptId: string, conceptName: string, subject: string): QuizQuestion[] {
  if (questionBank[conceptId]) return questionBank[conceptId];

  // Generate a simple self-assessment question for user-added concepts
  return [
    {
      id: `gen-${conceptId}-1`,
      conceptId,
      conceptName,
      subject,
      question: `How well can you explain "${conceptName}"?`,
      options: [
        "I can't recall it at all",
        "I remember bits and pieces",
        "I can explain it mostly",
        "I can explain it perfectly",
      ],
      correctIndex: 3, // "perfectly" = best answer
    },
    {
      id: `gen-${conceptId}-2`,
      conceptId,
      conceptName,
      subject,
      question: `Could you apply "${conceptName}" to solve a real problem?`,
      options: [
        "No, I've forgotten how",
        "Maybe with some help",
        "Yes, with minor review",
        "Absolutely, confidently",
      ],
      correctIndex: 3,
    },
  ];
}
