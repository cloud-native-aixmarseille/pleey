import { API_URL } from "../../app/config/api.config";
import { GameSocketAdapter } from "./infrastructure/game-socket.adapter";
import type { GameSession } from "./types";

interface CreateSessionResponse {
  pin: string;
  sessionId: number;
  quizId: number;
  hostId: number;
  status: string;
  currentQuestion: number | null;
  createdAt: string;
}

export class GameService {
  private readonly gameSocket = new GameSocketAdapter();

  async createSession(
    token: string,
    quizId: number,
  ): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_URL}/api/sessions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quizId }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "game.errors.sessionCreateFailed" }));
      throw new Error(errorData.message || "game.errors.sessionCreateFailed");
    }

    return await response.json();
  }

  async getActiveSessions(token: string): Promise<GameSession[]> {
    const response = await fetch(`${API_URL}/api/sessions/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("game.errors.activeSessionsFetchFailed");
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async getSessionsByQuiz(
    token: string,
    quizId: number,
  ): Promise<GameSession[]> {
    const response = await fetch(`${API_URL}/api/sessions/quiz/${quizId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("game.errors.activeSessionsFetchFailed");
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async stopSession(token: string, sessionId: number): Promise<GameSession> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/stop`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("game.errors.sessionStopFailed");
    }

    return await response.json();
  }

  async resumeSession(token: string, sessionId: number): Promise<GameSession> {
    const response = await fetch(
      `${API_URL}/api/sessions/${sessionId}/resume`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("game.errors.sessionResumeFailed");
    }

    return await response.json();
  }

  joinGame(
    pin: string,
    username: string,
    userId?: number,
    guestId?: string,
  ): void {
    this.gameSocket.publish({
      type: "join-game",
      pin,
      username,
      userId,
      guestId,
    });
  }

  startGame(pin: string): void {
    this.gameSocket.publish({ type: "start-game", pin });
  }

  stopGame(pin: string, hostId: number): void {
    this.gameSocket.publish({ type: "stop-game", pin, hostId });
  }

  endGame(pin: string, hostId: number): void {
    this.gameSocket.publish({ type: "end-game", pin, hostId });
  }

  resumeGame(pin: string, hostId: number): void {
    this.gameSocket.publish({ type: "resume-game", pin, hostId });
  }

  submitAnswer(
    pin: string,
    userId: number | undefined,
    answer: string,
    timeLeft: number,
    guestId?: string,
  ): void {
    this.gameSocket.publish({
      type: "submit-answer",
      pin,
      userId,
      guestId,
      answer,
      timeLeft,
    });
  }

  nextQuestion(pin: string): void {
    this.gameSocket.publish({ type: "next-question", pin });
  }
}

export const gameService = new GameService();
