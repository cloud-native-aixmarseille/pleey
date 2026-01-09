import type { Quiz } from "../../domains/quiz/types";

import { withDefaults } from "./fixture-utils";

export const createQuizFixture = (overrides: Partial<Quiz> = {}): Quiz => {
  return withDefaults(
    {
      id: 1,
      title: "Arcade Trivia",
      description: null,
      created_by: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      question_count: 0,
      is_active: false,
    },
    overrides,
  );
};
