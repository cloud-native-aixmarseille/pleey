import { API_URL } from '../../shared/config/api.config';
import { User } from '../../shared/types';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
  }
}

export const authService = new AuthService();
