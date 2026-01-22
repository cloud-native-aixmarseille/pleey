import type { Quiz } from "../../domains/quiz/types";

import { withDefaults } from "./fixture-utils";

export const createQuizFixture = (overrides: Partial<Quiz> = {}): Quiz => {
  return withDefaults(
    {
      id: 1,
      title: "Arcade Trivia",
      description: null,
      createdById: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      questionCount: 0,
      isActive: false,
    },
    overrides,
  );
};
