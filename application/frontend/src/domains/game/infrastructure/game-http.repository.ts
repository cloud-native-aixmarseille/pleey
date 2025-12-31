import { IGameRepository } from "../ports/game.repository.interface";
import { GameSession } from "../../../shared/types";
import { API_URL } from "../../../shared/config/api.config";

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
    const response = await fetch(`${this.baseUrl}/api/sessions/create`, {
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

    return response.json();
  }

  async getActiveSessions(token: string): Promise<GameSession[]> {
    const response = await fetch(`${this.baseUrl}/api/sessions/active`, {
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
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${sessionId}/stop`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("game.errors.sessionStopFailed");
    }

    return response.json();
  }

  async resumeSession(token: string, sessionId: number): Promise<GameSession> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${sessionId}/resume`,
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

    return response.json();
  }
}
