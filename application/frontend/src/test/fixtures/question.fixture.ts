import type { Question } from "../../domains/quiz/types";

import { withDefaults } from "./fixture-utils";

export const createQuestionFixture = (
  overrides: Partial<Question> = {},
): Question => {
  return withDefaults(
    {
      id: 1,
      quiz_id: 1,
      question_text: "What is 2+2?",
      type: "multiple",
      correct_answer: "A",
      option_a: "4",
      option_b: "3",
      option_c: null,
      option_d: null,
      time_limit: 20,
      points: 100,
    },
    overrides,
  );
};
