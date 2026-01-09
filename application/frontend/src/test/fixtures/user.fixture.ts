import type { User } from "../../domains/auth/types";

import { withDefaults } from "./fixture-utils";

export const createUserFixture = (overrides: Partial<User> = {}): User => {
  return withDefaults(
    {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      isAdmin: false,
      avatarUrl: null,
    },
    overrides,
  );
};
