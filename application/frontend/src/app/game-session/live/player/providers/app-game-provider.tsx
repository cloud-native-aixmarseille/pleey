import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { GetGameLobbyStateUseCase } from '../../../../../application/game-session/live/player/use-cases/get-game-lobby-state-use-case';
import { GetStageActionDistributionUseCase } from '../../../../../application/game-session/live/player/use-cases/get-stage-action-distribution-use-case';
import { JoinGameUseCase } from '../../../../../application/game-session/live/player/use-cases/join-game-use-case';
import { ListStageActionChoicesUseCase } from '../../../../../application/game-session/live/player/use-cases/list-stage-action-choices-use-case';
import { JoinGameDispatchReceiptStatus } from '../../../../../application/game-session/live/shared/contracts/game-session-join-runtime.contract';
import { GameJoinErrorResolutionService } from '../../../../../domains/game-session/services/game-join-error-resolution.service';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import { LeaderboardService } from '../../../../../domains/game-session/services/leaderboard-service';
import {
  type GameJoinContextValue,
  GameJoinProvider,
} from '../../../../../presentation/game-session/live/shared/contexts/game-join-context';
import { GameLeaderboardProvider } from '../../../../../presentation/game-session/live/shared/contexts/game-leaderboard-context';
import { GameLobbyStateProvider } from '../../../../../presentation/game-session/live/shared/contexts/game-lobby-state-context';
import {
  type GameStageContextValue,
  GameStageProvider,
} from '../../../../../presentation/game-session/live/shared/contexts/game-stage-context';
import { runtimeContainer } from '../../../../composition/runtime-container';
import { useAppGameJoinState } from '../hooks/use-app-game-join-state';
import { AppGuestPlayerRuntime } from '../runtimes/app-guest-player-runtime';

export function AppGameProvider({ children }: PropsWithChildren) {
  const servicesRef = useRef<{
    readonly joinGameFlow: JoinGameFlowService;
    readonly leaderboard: LeaderboardService;
    readonly gameLobbyState: GetGameLobbyStateUseCase;
    readonly stageActionChoices: ListStageActionChoicesUseCase;
    readonly stageActionDistribution: GetStageActionDistributionUseCase;
    readonly guestPlayerService: AppGuestPlayerRuntime;
    readonly joinGameUseCase: JoinGameUseCase;
    readonly gameJoinErrorResolutionService: GameJoinErrorResolutionService;
  } | null>(null);

  if (!servicesRef.current) {
    servicesRef.current = {
      joinGameFlow: runtimeContainer.get(JoinGameFlowService),
      leaderboard: runtimeContainer.get(LeaderboardService),
      gameLobbyState: runtimeContainer.get(GetGameLobbyStateUseCase),
      stageActionChoices: runtimeContainer.get(ListStageActionChoicesUseCase),
      stageActionDistribution: runtimeContainer.get(GetStageActionDistributionUseCase),
      guestPlayerService: runtimeContainer.get(AppGuestPlayerRuntime),
      joinGameUseCase: runtimeContainer.get(JoinGameUseCase),
      gameJoinErrorResolutionService: runtimeContainer.get(GameJoinErrorResolutionService),
    };
  }

  const services = servicesRef.current;

  if (!services) {
    throw new Error('Game provider services unavailable');
  }

  const {
    joinGameFlow,
    leaderboard,
    gameLobbyState,
    stageActionChoices,
    stageActionDistribution,
    guestPlayerService,
    joinGameUseCase,
    gameJoinErrorResolutionService,
  } = services;
  const restoredGuest = guestPlayerService.restore();
  const {
    errorCode,
    guestNickname,
    isSubmitting,
    lastJoinRequest,
    startSubmit,
    completeAuthenticatedJoin,
    completeGuestJoin,
    failSubmit,
    clearError,
  } = useAppGameJoinState(restoredGuest?.nickname ?? '');

  const joinAsAuthenticated = useCallback(
    async (input: {
      readonly pin: string;
      readonly userId: number;
      readonly username: string;
    }): Promise<void> => {
      startSubmit();

      try {
        const { receipt, request } = await joinGameUseCase.executeWithReceipt(input);

        if (receipt.status === JoinGameDispatchReceiptStatus.REJECTED) {
          throw new Error(receipt.errorCode);
        }

        completeAuthenticatedJoin({
          pin: request.pin,
          username: request.username,
        });
      } catch (error) {
        failSubmit(gameJoinErrorResolutionService.resolve(error));
      }
    },
    [completeAuthenticatedJoin, failSubmit, gameJoinErrorResolutionService, startSubmit],
  );

  const joinAsGuest = useCallback(
    async (input: { readonly pin: string; readonly nickname: string }): Promise<void> => {
      startSubmit();

      try {
        const guest = guestPlayerService.resolveIdentity(input.nickname);
        const request = joinGameUseCase.buildRequest({
          pin: input.pin,
          username: guest.nickname,
          guestId: guest.id,
        });
        guestPlayerService.remember(guest);
        const { receipt } = await joinGameUseCase.executeWithReceipt({
          pin: input.pin,
          username: guest.nickname,
          guestId: guest.id,
        });

        if (receipt.status === JoinGameDispatchReceiptStatus.REJECTED) {
          throw new Error(receipt.errorCode);
        }

        completeGuestJoin(guest.nickname, {
          avatarUri: receipt.avatarUri,
          guestId: guest.id,
          pin: request.pin,
          username: request.username,
        });
      } catch (error) {
        failSubmit(gameJoinErrorResolutionService.resolve(error));
      }
    },
    [completeGuestJoin, failSubmit, gameJoinErrorResolutionService, joinGameUseCase, startSubmit],
  );

  const joinValue = useMemo<GameJoinContextValue>(
    () => ({
      joinGameFlow,
      errorCode,
      guestNickname,
      isSubmitting,
      lastJoinRequest,
      clearError,
      joinAsAuthenticated,
      joinAsGuest,
    }),
    [
      clearError,
      errorCode,
      guestNickname,
      isSubmitting,
      joinAsAuthenticated,
      joinAsGuest,
      lastJoinRequest,
    ],
  );

  const stageValue = useMemo<GameStageContextValue>(
    () => ({
      stageActionChoices,
      stageActionDistribution,
    }),
    [stageActionChoices, stageActionDistribution],
  );

  return (
    <GameJoinProvider value={joinValue}>
      <GameLobbyStateProvider value={gameLobbyState}>
        <GameStageProvider value={stageValue}>
          <GameLeaderboardProvider value={leaderboard}>{children}</GameLeaderboardProvider>
        </GameStageProvider>
      </GameLobbyStateProvider>
    </GameJoinProvider>
  );
}
