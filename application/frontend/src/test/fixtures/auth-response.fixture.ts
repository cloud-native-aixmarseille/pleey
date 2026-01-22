import type { User } from "../../domains/auth/types";

import { withDefaults } from "./fixture-utils";
import { createUserFixture } from "./user.fixture";

type AuthResponsePayloadFixture = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
};

export const createAuthResponsePayloadFixture = (
  overrides: AuthResponsePayloadFixture = {},
) => {
  return withDefaults(
    {
      token: "mock-jwt-token",
      accessToken: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 7200,
      user: createUserFixture(),
    },
    overrides,
  );
};
