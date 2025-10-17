import { API_URL } from '../../shared/config/api.config';
import { socket } from '../../shared/socket/socket.client';

export class GameService {
  async createSession(token: string, quizId: number): Promise<{ pin: string }> {
    const response = await fetch(`${API_URL}/api/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quizId })
    });
    return await response.json();
  }

  joinGame(pin: string, username: string, userId: number): void {
    socket.emit('join-game', { pin, username, userId });
  }

  startGame(pin: string): void {
    socket.emit('start-game', { pin });
  }

  submitAnswer(pin: string, userId: number, answer: string, timeLeft: number): void {
    socket.emit('submit-answer', { pin, userId, answer, timeLeft });
  }

  nextQuestion(pin: string): void {
    socket.emit('next-question', { pin });
  }
}

export const gameService = new GameService();
