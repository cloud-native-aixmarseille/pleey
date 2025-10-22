import { API_URL } from '../../shared/config/api.config';
import { User } from '../../shared/types';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        'Identifiants invalides';
      throw new Error(message);
    }

    if (!data?.token || !data?.user) {
      throw new Error('Réponse de connexion invalide');
    }

    return data;
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
