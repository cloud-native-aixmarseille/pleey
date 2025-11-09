import { fetchClient } from '../../shared/api/openapiClient';
import { User } from '../../shared/types';
import { resolveAuthErrorKey } from './utils/resolve-auth-error';

export class AuthService {
  async login(email: string, password: string): Promise<{
    token: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  }> {
    const { data, error } = await fetchClient.POST('/api/login', {
      body: { email, password } as any,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error || !data) {
      const messageKey = resolveAuthErrorKey(error, 'auth.errors.invalidCredentials');
      throw new Error(messageKey);
    }

    const result = data as Partial<{
      token: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: User;
    }>;

    const accessToken = result.accessToken ?? result.token;
    const refreshToken = result.refreshToken;
    const user = result.user;

    if (!accessToken || !refreshToken || !user) {
      throw new Error('auth.errors.invalidResponse');
    }

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn: result.expiresIn ?? 0,
      user,
    };
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const { error } = await fetchClient.POST('/api/register', {
      body: { username, email, password } as any,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      const messageKey = resolveAuthErrorKey(error, 'auth.errors.registrationFailed');
      throw new Error(messageKey);
    }
  }

  async getProfile(): Promise<User> {
    const { data, error } = await fetchClient.GET('/api/profile/me', {} as any);

    if (error || !data) {
      const messageKey = resolveAuthErrorKey(error, 'profile.errors.loadFailed');
      throw new Error(messageKey);
    }

    return data as User;
  }

  async updateProfile(updates: { username?: string; email?: string }): Promise<User> {
    const { data, error } = await fetchClient.PATCH('/api/profile/me', {
      body: updates as any,
      headers: {
        'Content-Type': 'application/json',
      },
    } as any);

    if (error || !data) {
      const messageKey = resolveAuthErrorKey(error, 'profile.updateError');
      throw new Error(messageKey);
    }

    return data as User;
  }

  async regenerateAvatar(): Promise<User> {
    const { data, error } = await fetchClient.POST('/api/profile/me/avatar' as any, {} as any);

    if (error || !data) {
      const messageKey = resolveAuthErrorKey(error, 'profile.avatarRegenerateError');
      throw new Error(messageKey);
    }

    return data as User;
  }

  async logout(): Promise<void> {
    const { error } = await fetchClient.POST('/api/logout' as any, {
      headers: {
        'Content-Type': 'application/json',
      },
      middleware: [
        {
          onRequest: ({ request }: { request: Request }) => {
            request.headers.set('x-refresh-attempted', 'true');
          },
        },
      ],
    } as any);

    if (error) {
      // Intentionally swallow errors to ensure client session shuts down.
      return;
    }
  }
}

export const authService = new AuthService();
