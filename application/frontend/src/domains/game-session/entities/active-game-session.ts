import type { GameSessionStatus } from './game-session-status';

export enum GameSessionParticipantRole {
  HOST = 'HOST',
  PLAYER = 'PLAYER',
}

export interface DashboardActiveSessionItem {
  readonly sessionId: number;
  readonly gameId: number;
  readonly pin: string;
  readonly status: GameSessionStatus;
  readonly currentStageId: number | null;
  readonly participantRole: GameSessionParticipantRole;
  readonly createdAt: string;
}
