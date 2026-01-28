export const GAME_SESSION_ROUTING_GATEWAY = Symbol.for('gameSessionRoutingGateway');

export interface SessionRoutingInput {
  readonly pin: string;
  readonly currentStageId?: number | null;
  readonly status: string;
}

export interface GameSessionRoutingGateway {
  resolveJoinRoute(pin?: string): string;
  resolveLobbyRoute(pin: string): string;
  resolveStageRoute(pin: string, stageId: number): string;
  resolveStageResultRoute(pin: string, stageId: number): string;
  resolveLeaderboardRoute(pin: string): string;
  resolveEntryRoute(session: SessionRoutingInput): string;
}
