import { IAuthRepository } from '../ports/auth.repository.interface';
import { User } from '../../../shared/types';
import { fetchClient } from '../../../shared/api/openapiClient';

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
      const message =
        (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Invalid credentials');
      throw new Error(message);
    }

    const result = data as { token?: string; user?: User };

    if (!result.token || !result.user) {
      throw new Error('Invalid login response');
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
      const message =
        (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Registration failed');
      throw new Error(message);
    }
  }
}
