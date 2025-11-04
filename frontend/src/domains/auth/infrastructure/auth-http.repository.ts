import { IAuthRepository } from '../ports/auth.repository.interface';
import { User } from '../../../shared/types';
import { API_URL } from '../../../shared/config/api.config';

/**
 * HTTP implementation of Authentication Repository
 * Handles API communication for authentication operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class AuthHttpRepository implements IAuthRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        'Invalid credentials';
      throw new Error(message);
    }

    if (!data?.token || !data?.user) {
      throw new Error('Invalid login response');
    }

    return data;
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        'Registration failed';
      throw new Error(message);
    }
  }
}
