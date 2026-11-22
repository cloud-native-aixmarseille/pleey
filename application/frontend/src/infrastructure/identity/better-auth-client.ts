import { createAuthClient } from 'better-auth/client';
import { anonymousClient } from 'better-auth/client/plugins';

export const betterAuthClient = createAuthClient({
  baseURL: `${globalThis.location.origin}/api/auth`,
  plugins: [anonymousClient()],
  fetchOptions: {
    credentials: 'include',
  },
});
