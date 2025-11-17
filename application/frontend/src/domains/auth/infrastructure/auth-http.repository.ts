import { IAuthRepository } from '../ports/auth.repository.interface';
import { User } from '../../../shared/types';
import { fetchClient } from '../../../shared/api/openapiClient';
import { resolveAuthErrorKey } from '../utils/resolve-auth-error';
import { castRequestBody } from '../../../shared/api/castRequestBody';
import { isAuthResponsePayload, isUserPayload } from '../utils/auth-response.guard';

/**
 * HTTP implementation of Authentication Repository
 * Handles API communication for authentication operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class AuthHttpRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<{
    token: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  }> {
    const { data, error } = await fetchClient.POST('/api/login', {
      body: castRequestBody({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const authPayload = data as unknown;

    if (error) {
      const messageKey = resolveAuthErrorKey(error, 'auth.errors.invalidCredentials');
      throw new Error(messageKey);
    }

    if (!isAuthResponsePayload(authPayload)) {
      throw new Error('auth.errors.invalidResponse');
    }

    const accessToken = authPayload.accessToken ?? authPayload.token;
    const refreshToken = authPayload.refreshToken;
    const user = authPayload.user;

    if (!accessToken || !refreshToken || !isUserPayload(user)) {
      throw new Error('auth.errors.invalidResponse');
    }

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn: authPayload.expiresIn ?? 0,
      user,
    };
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const { error } = await fetchClient.POST('/api/register', {
      body: castRequestBody({ username, email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      const messageKey = resolveAuthErrorKey(error, 'auth.errors.registrationFailed');
      throw new Error(messageKey);
    }
  }

  async getCurrentUser(): Promise<User> {
    const { data, error } = await fetchClient.GET('/api/profile/me');

    if (error || !isUserPayload(data)) {
      const messageKey = resolveAuthErrorKey(error, 'profile.errors.loadFailed');
      throw new Error(messageKey);
    }

    return data;
  }

  async updateProfile(updates: { username?: string; email?: string }): Promise<User> {
    const { data, error } = await fetchClient.PATCH('/api/profile/me', {
      body: castRequestBody(updates),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error || !isUserPayload(data)) {
      const messageKey = resolveAuthErrorKey(error, 'profile.updateError');
      throw new Error(messageKey);
    }

    return data;
  }

  async regenerateAvatar(): Promise<User> {
    const { data, error } = await fetchClient.POST('/api/profile/me/avatar', undefined);

    if (error || !isUserPayload(data)) {
      const messageKey = resolveAuthErrorKey(error, 'profile.avatarRegenerateError');
      throw new Error(messageKey);
    }

    return data;
  }

  async logout(): Promise<void> {
    const { error } = await fetchClient.POST('/api/logout', {
      headers: {
        'Content-Type': 'application/json',
      },
      middleware: [
        {
          onRequest: ({ request }) => {
            request.headers.set('x-refresh-attempted', 'true');
          },
        },
      ],
    });

    if (error) {
      // No-op: treat backend logout failure as non-blocking
      return;
    }
  }
}
