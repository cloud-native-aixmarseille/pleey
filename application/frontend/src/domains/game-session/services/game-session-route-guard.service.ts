import { injectable } from 'inversify';
import type { GameStage } from '../entities/game-stage';
import { GameLobbyErrorCode } from '../errors/game-lobby-error-code';
import { GamePlayingErrorCode } from '../errors/game-playing-error-code';

export enum GameRouteKind {
  LOBBY = 'lobby',
  STAGE = 'stage',
  RESULT = 'result',
  LEADERBOARD = 'leaderboard',
}

export interface GameSessionRouteResolvers {
  resolveJoinRoute(): string;
  resolveLobbyRoute(pin: string): string;
  resolveStageRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string;
  resolveStageResultRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string;
  resolveLeaderboardRoute(pin: string): string;
}

interface ResolveGameSessionRouteGuardInput {
  readonly routeKind: GameRouteKind;
  readonly sessionPin: string;
  readonly hasRestoredSession: boolean;
  readonly isAuthenticated: boolean;
  readonly hasIdentity: boolean;
  readonly hasGameStarted: boolean;
  readonly lobbyErrorCode: GameLobbyErrorCode | null;
  readonly currentStage: Pick<GameStage, 'id'> | null;
  readonly actionResult: object | null;
  readonly hasGameEnded: boolean;
  readonly playingErrorCode: GamePlayingErrorCode | null;
  readonly isResultTransitionActive: boolean;
}

@injectable()
export class GameSessionRouteGuardService {
  resolveRedirect(
    input: ResolveGameSessionRouteGuardInput,
    routeResolvers: GameSessionRouteResolvers,
  ): string | null {
    const normalizedPin = input.sessionPin.trim().toUpperCase();

    if (!normalizedPin || !input.hasRestoredSession) {
      return null;
    }

    if (!input.hasIdentity || this.isFatalError(input.lobbyErrorCode, input.playingErrorCode)) {
      return routeResolvers.resolveJoinRoute();
    }

    switch (input.routeKind) {
      case GameRouteKind.LOBBY:
        if (input.hasGameEnded) {
          return routeResolvers.resolveLeaderboardRoute(normalizedPin);
        }
        if (input.hasGameStarted && input.currentStage) {
          return input.actionResult
            ? routeResolvers.resolveStageResultRouteForStage(normalizedPin, input.currentStage)
            : routeResolvers.resolveStageRouteForStage(normalizedPin, input.currentStage);
        }
        return null;

      case GameRouteKind.STAGE:
        if (input.hasGameEnded) {
          return routeResolvers.resolveLeaderboardRoute(normalizedPin);
        }
        if (input.actionResult && input.currentStage) {
          return routeResolvers.resolveStageResultRouteForStage(normalizedPin, input.currentStage);
        }
        return null;

      case GameRouteKind.RESULT:
        if (input.hasGameEnded) {
          return routeResolvers.resolveLeaderboardRoute(normalizedPin);
        }
        if (!input.actionResult && input.currentStage && !input.isResultTransitionActive) {
          return routeResolvers.resolveStageRouteForStage(normalizedPin, input.currentStage);
        }
        return null;

      case GameRouteKind.LEADERBOARD:
        if (!input.hasGameEnded && input.currentStage) {
          return input.actionResult
            ? routeResolvers.resolveStageResultRouteForStage(normalizedPin, input.currentStage)
            : routeResolvers.resolveStageRouteForStage(normalizedPin, input.currentStage);
        }
        if (!input.hasGameEnded) {
          return routeResolvers.resolveLobbyRoute(normalizedPin);
        }
        return null;

      default:
        return null;
    }
  }

  private isFatalError(
    lobbyErrorCode: GameLobbyErrorCode | null,
    playingErrorCode: GamePlayingErrorCode | null,
  ): boolean {
    return (
      lobbyErrorCode === GameLobbyErrorCode.GAME_NOT_FOUND ||
      lobbyErrorCode === GameLobbyErrorCode.GAME_SESSION_ENDED ||
      playingErrorCode === GamePlayingErrorCode.GAME_NOT_FOUND ||
      playingErrorCode === GamePlayingErrorCode.GAME_SESSION_ENDED
    );
  }
}
