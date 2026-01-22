import type { Question } from "../../domains/quiz/types";

export const createQuestionFixture = (
  overrides: Partial<Question> = {},
): Question => {
  const defaults: Question = {
    id: 1,
    quizId: 1,
    position: 0,
    questionText: "What is 2+2?",
    type: "multiple",
    answers: [
      { id: 1, text: "4", position: 0, isCorrect: true },
      { id: 2, text: "3", position: 1, isCorrect: false },
      { id: 3, text: null, position: 2, isCorrect: false },
      { id: 4, text: null, position: 3, isCorrect: false },
    ],
    timeLimit: 20,
    points: 100,
  };

  const merged = { ...defaults } as Question;
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
};
