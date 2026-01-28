import { injectable } from 'inversify';
import type { GameStage } from '../entities/game-stage';

interface GameStageRouteResolvers {
  resolveLobbyRoute(pin: string): string;
  resolveStageRoute(pin: string, stageId: number): string;
}

interface ResolveGameStageScreenRedirectInput {
  readonly sessionPin: string;
  readonly hasRestoredSession: boolean;
  readonly requestedStageId: number;
  readonly currentStage: Pick<GameStage, 'id'> | null;
  readonly hasGameEnded: boolean;
  readonly hasStageWaitTimedOut: boolean;
}

@injectable()
export class GameStageScreenRoutingService {
  readonly waitTimeoutMs = 3000;

  resolveRedirect(
    input: ResolveGameStageScreenRedirectInput,
    routeResolvers: GameStageRouteResolvers,
  ): string | null {
    const normalizedPin = input.sessionPin.trim().toUpperCase();

    if (!normalizedPin || !input.hasRestoredSession) {
      return null;
    }

    if (input.currentStage && input.currentStage.id !== input.requestedStageId) {
      return routeResolvers.resolveStageRoute(normalizedPin, input.currentStage.id);
    }

    if (!input.currentStage && !input.hasGameEnded && input.hasStageWaitTimedOut) {
      return routeResolvers.resolveLobbyRoute(normalizedPin);
    }

    return null;
  }

  shouldResetWaitTimeout(input: {
    readonly currentStage: Pick<GameStage, 'id'> | null;
    readonly hasGameEnded: boolean;
  }): boolean {
    return input.currentStage !== null || input.hasGameEnded;
  }
}
