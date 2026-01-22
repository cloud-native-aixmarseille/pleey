import type { GameRepository } from "./ports/game.repository";
import type { GameSocket } from "./ports/game-socket";
import type { GameSession } from "./types";

type CreateSessionResponse = GameSession;

export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameSocket: GameSocket,
  ) { }

  async createSession(
    token: string,
    quizId: number,
  ): Promise<CreateSessionResponse> {
    return await this.gameRepository.createSession(token, quizId);
  }

  async getActiveSessions(token: string): Promise<GameSession[]> {
    return await this.gameRepository.getActiveSessions(token);
  }

  async getSessionsByQuiz(
    token: string,
    quizId: number,
  ): Promise<GameSession[]> {
    return await this.gameRepository.getSessionsByQuiz(token, quizId);
  }

  async stopSession(token: string, sessionId: number): Promise<GameSession> {
    return await this.gameRepository.stopSession(token, sessionId);
  }

  async resumeSession(token: string, sessionId: number): Promise<GameSession> {
    return await this.gameRepository.resumeSession(token, sessionId);
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
    answerId: number,
    timeLeft: number,
    guestId?: string,
  ): void {
    this.gameSocket.publish({
      type: "submit-answer",
      pin,
      userId,
      guestId,
      answerId,
      timeLeft,
    });
  }

  nextQuestion(pin: string): void {
    this.gameSocket.publish({ type: "next-question", pin });
  }
}
