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

  async getActiveSessions(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/sessions/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.sessions || [];
  }

  async stopSession(token: string, sessionId: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/stop`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }

  async resumeSession(token: string, sessionId: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/resume`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }

  joinGame(pin: string, username: string, userId?: number, guestId?: string): void {
    socket.emit('join-game', { pin, username, userId, guestId });
  }

  startGame(pin: string): void {
    socket.emit('start-game', { pin });
  }

  stopGame(pin: string): void {
    socket.emit('stop-game', { pin });
  }

  resumeGame(pin: string): void {
    socket.emit('resume-game', { pin });
  }

  submitAnswer(pin: string, userId: number | undefined, answer: string, timeLeft: number, guestId?: string): void {
    socket.emit('submit-answer', { pin, userId, answer, timeLeft, guestId });
  }

  nextQuestion(pin: string): void {
    socket.emit('next-question', { pin });
  }
}

export const gameService = new GameService();
