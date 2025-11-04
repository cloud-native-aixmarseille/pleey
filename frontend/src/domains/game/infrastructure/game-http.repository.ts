import { IGameRepository } from '../ports/game.repository.interface';
import { GameSession } from '../../../shared/types';
import { API_URL } from '../../../shared/config/api.config';

/**
 * HTTP implementation of Game Repository
 * Handles API communication for game session operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class GameHttpRepository implements IGameRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async createSession(token: string, quizId: number): Promise<GameSession> {
    const response = await fetch(`${this.baseUrl}/api/game/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quiz_id: quizId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create game session');
    }

    return response.json();
  }
}
