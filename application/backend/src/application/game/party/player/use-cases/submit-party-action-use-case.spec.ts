import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { SubmitPartyActionUseCase } from './submit-party-action-use-case';

const gameId = backendTestIdentifiers.game(9);
const partyId = backendTestIdentifiers.party(44);
const playerUserId = backendTestIdentifiers.user(42);
const selectedActionId = backendTestIdentifiers.partyAction(2);
const stageId = backendTestIdentifiers.partyStage(101);

describe('SubmitPartyActionUseCase', () => {
  it('delegates action evaluation through the resolved game-type policy and broadcasts the updated observation', async () => {
    const playerIdentity = {
      kind: PartyPlayerKind.USER,
      userId: playerUserId,
    } as const;
    const nextContext = {
      lifecycle: {
        phase: 'stage',
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId,
        stagePosition: 0,
        stageTimeLimitSeconds: 20,
        totalStages: 3,
      },
      stage: {
        actionSubmission: {
          currentPlayer: {
            selectedActionId,
            status: 'acknowledged',
          },
          submittedPlayerCount: 1,
          totalEligiblePlayerCount: 3,
        },
        current: {
          actions: [
            { id: backendTestIdentifiers.partyAction(1), text: 'A' },
            { id: selectedActionId, text: 'B' },
            { id: backendTestIdentifiers.partyAction(3), text: 'C' },
            { id: backendTestIdentifiers.partyAction(4), text: 'D' },
          ],
          endsAtEpochMs: 30_000,
          stageId,
          stagePosition: 0,
          text: 'Question 1',
        },
      },
    } as const;
    const policy = {
      evaluateSubmission: vi.fn().mockResolvedValue({
        context: nextContext,
        scoreDelta: 750,
        status: PartyStatus.ACTIVE,
      }),
    };
    const policyRegistry = {
      resolveByGameType: vi.fn().mockReturnValue(policy),
    };
    const playerPartyActionRuntime = {
      findSubmissionTarget: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 30_000,
            stageRemainingDurationMs: 20_000,
            stageId,
            stagePosition: 0,
            stageTimeLimitSeconds: 20,
            totalStages: 3,
          },
        },
        gameId,
        gameType: GameType.Quiz,
        partyId,
        playerIdentity,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        status: PartyStatus.ACTIVE,
      }),
      saveSubmissionResult: vi.fn().mockResolvedValue(undefined),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new SubmitPartyActionUseCase(
      playerPartyActionRuntime as never,
      policyRegistry as never,
      broadcastPartyObservationUseCase as never,
    );

    await useCase.execute({
      actionId: selectedActionId,
      partyId,
      playerIdentity,
    });

    expect(policyRegistry.resolveByGameType).toHaveBeenCalledWith(GameType.Quiz);
    expect(policy.evaluateSubmission).toHaveBeenCalledWith({
      actionId: selectedActionId,
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId,
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      gameId,
      partyId,
      playerIdentity,
      status: PartyStatus.ACTIVE,
    });
    expect(playerPartyActionRuntime.saveSubmissionResult).toHaveBeenCalledWith({
      actionId: selectedActionId,
      context: nextContext,
      partyId,
      playerIdentity,
      scoreDelta: 750,
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId,
    });
  });

  it('accepts answer changes within the same stage when the party setting allows it', async () => {
    const playerIdentity = {
      kind: PartyPlayerKind.USER,
      userId: playerUserId,
    } as const;
    const policy = {
      evaluateSubmission: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 40_000,
            stageRemainingDurationMs: 10_000,
            stageId,
            stagePosition: 0,
            stageTimeLimitSeconds: 20,
            totalStages: 3,
          },
        },
        scoreDelta: 0,
        status: PartyStatus.ACTIVE,
      }),
    };
    const policyRegistry = {
      resolveByGameType: vi.fn().mockReturnValue(policy),
    };
    const playerPartyActionRuntime = {
      findSubmissionTarget: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 30_000,
            stageRemainingDurationMs: 20_000,
            stageId,
            stagePosition: 0,
            stageTimeLimitSeconds: 20,
            totalStages: 3,
          },
        },
        gameId,
        gameType: GameType.Quiz,
        partyId,
        playerActionState: {
          earnedPoints: 500,
          selectedActionId,
          stageId,
          stagePosition: 0,
          status: 'acknowledged',
        },
        playerIdentity,
        settings: {
          allowOptionChangeAfterVoting: true,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        status: PartyStatus.ACTIVE,
      }),
      saveSubmissionResult: vi.fn().mockResolvedValue(undefined),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new SubmitPartyActionUseCase(
      playerPartyActionRuntime as never,
      policyRegistry as never,
      broadcastPartyObservationUseCase as never,
    );

    await useCase.execute({
      actionId: selectedActionId,
      partyId,
      playerIdentity,
    });

    expect(policy.evaluateSubmission).toHaveBeenCalledTimes(1);
    expect(playerPartyActionRuntime.saveSubmissionResult).toHaveBeenCalledTimes(1);
  });
});
