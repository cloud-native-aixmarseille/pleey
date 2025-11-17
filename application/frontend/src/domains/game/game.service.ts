import { API_URL } from '../../shared/config/api.config';
import { socket } from '../../shared/socket/socket.client';
import { GameSession } from '../../shared/types';

interface CreateSessionResponse {
  pin: string;
  sessionId: number;
  quizId: number;
  adminId: number;
  status: string;
  currentQuestion: number | null;
  createdAt: string;
}

export class GameService {
  async createSession(token: string, quizId: number): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_URL}/api/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quizId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'game.errors.sessionCreateFailed' }));
      throw new Error(errorData.message || 'game.errors.sessionCreateFailed');
    }

    return await response.json();
  }

  async getActiveSessions(token: string): Promise<GameSession[]> {
    const response = await fetch(`${API_URL}/api/sessions/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('game.errors.activeSessionsFetchFailed');
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async getSessionsByQuiz(token: string, quizId: number): Promise<GameSession[]> {
    const response = await fetch(`${API_URL}/api/sessions/quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('game.errors.activeSessionsFetchFailed');
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async stopSession(token: string, sessionId: number): Promise<GameSession> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/stop`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('game.errors.sessionStopFailed');
    }

    return await response.json();
  }

  async resumeSession(token: string, sessionId: number): Promise<GameSession> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/resume`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('game.errors.sessionResumeFailed');
    }

    return await response.json();
  }

  joinGame(pin: string, username: string, userId?: number, guestId?: string): void {
    socket.emit('join-game', { pin, username, userId, guestId });
  }

  startGame(pin: string): void {
    socket.emit('start-game', { pin });
  }

  stopGame(pin: string, adminId: number): void {
    socket.emit('stop-game', { pin, adminId });
  }

  resumeGame(pin: string, adminId: number): void {
    socket.emit('resume-game', { pin, adminId });
  }

  submitAnswer(pin: string, userId: number | undefined, answer: string, timeLeft: number, guestId?: string): void {
    socket.emit('submit-answer', { pin, userId, answer, timeLeft, guestId });
  }

  nextQuestion(pin: string): void {
    socket.emit('next-question', { pin });
  }
}

export const gameService = new GameService();
