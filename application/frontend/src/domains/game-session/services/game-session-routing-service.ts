import { injectable } from 'inversify';
import type {
  GameSessionRoutingGateway,
  SessionRoutingInput,
} from '../../../application/game-session/live/shared/gateways/game-session-routing.gateway';
import { GameSessionStatus } from '../entities/game-session-status';
import type { GameStage } from '../entities/game-stage';

@injectable()
export class GameSessionRoutingService implements GameSessionRoutingGateway {
  resolveJoinRoute(pin?: string): string {
    if (pin && pin.length > 0) {
      return `/game/join?pin=${encodeURIComponent(pin)}`;
    }

    return '/game/join';
  }

  resolveLobbyRoute(pin: string): string {
    return `/game/${this.normalizePin(pin)}/lobby`;
  }

  resolveStageRoute(pin: string, stageId: number): string {
    return `/game/${this.normalizePin(pin)}/stage/${stageId}`;
  }

  resolveStageResultRoute(pin: string, stageId: number): string {
    return `/game/${this.normalizePin(pin)}/stage/${stageId}/result`;
  }

  resolveStageRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string {
    return this.resolveStageRoute(pin, stage.id);
  }

  resolveStageResultRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string {
    return this.resolveStageResultRoute(pin, stage.id);
  }

  resolveLeaderboardRoute(pin: string): string {
    return `/game/${this.normalizePin(pin)}/leaderboard`;
  }

  resolveEntryRoute(session: SessionRoutingInput): string {
    switch (session.status) {
      case GameSessionStatus.ACTIVE:
        return typeof session.currentStageId === 'number'
          ? this.resolveStageRoute(session.pin, session.currentStageId)
          : this.resolveLobbyRoute(session.pin);

      case GameSessionStatus.PAUSED:
        return this.resolveLobbyRoute(session.pin);

      case GameSessionStatus.ENDED:
        return this.resolveLeaderboardRoute(session.pin);

      default:
        return this.resolveLobbyRoute(session.pin);
    }
  }

  private normalizePin(pin: string): string {
    return pin.trim().toUpperCase();
  }
}
