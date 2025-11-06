import { IAuthRepository } from '../ports/auth.repository.interface';
import { User } from '../../../shared/types';
import { fetchClient } from '../../../shared/api/openapiClient';
import { resolveAuthErrorKey } from '../utils/resolve-auth-error';

/**
 * HTTP implementation of Authentication Repository
 * Handles API communication for authentication operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class AuthHttpRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
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

    const result = data as { token?: string; user?: User };

    if (!result.token || !result.user) {
      throw new Error('auth.errors.invalidResponse');
    }

    return { token: result.token, user: result.user };
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

  async getCurrentUser(): Promise<User> {
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
}
