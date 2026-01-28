import type { DashboardActiveSessionItem } from '../entities/active-game-session';

export interface GameSessionRepository {
  createGameSession(gameId: number): Promise<DashboardActiveSessionItem>;
  getActiveSessionByPin(pin: string): Promise<DashboardActiveSessionItem | null>;
  getActiveSessions(): Promise<DashboardActiveSessionItem[]>;
  getCurrentPlayerSession(): Promise<DashboardActiveSessionItem | null>;
  leaveCurrentPlayerSession(): Promise<boolean>;
  resumeGameSession(sessionId: number): Promise<DashboardActiveSessionItem>;
  stopGameSession(sessionId: number): Promise<DashboardActiveSessionItem>;
}
