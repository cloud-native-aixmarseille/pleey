import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { UserIdentifier } from '../../../../identity/shared/services/identifiers/user-identifier';
import { GameIdentifier } from '../../../shared/services/identifiers/game-identifier';
import { PartyActionIdentifier } from '../../shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../shared/services/identifiers/party-identifier';
import { SubmitPartyActionUseCase } from './submit-party-action-use-case';

const gameIdentifier = new GameIdentifier();
const partyActionIdentifier = new PartyActionIdentifier();
const partyIdentifier = new PartyIdentifier();
const userIdentifier = new UserIdentifier();

describe('SubmitPartyActionUseCase', () => {
  it('delegates action evaluation through the resolved game-type policy and broadcasts the updated observation', async () => {
    const playerIdentity = {
      kind: PartyPlayerKind.USER,
      userId: userIdentifier.parse(42),
    } as const;
    const nextContext = {
      lifecycle: {
        phase: 'stage',
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId: 101,
        stagePosition: 0,
        stageTimeLimitSeconds: 20,
        totalStages: 3,
      },
      stage: {
        actionSubmission: {
          currentPlayer: {
            selectedActionId: partyActionIdentifier.parse(2),
            status: 'acknowledged',
          },
          submittedPlayerCount: 1,
          totalEligiblePlayerCount: 3,
        },
        current: {
          actions: [
            { id: partyActionIdentifier.parse(1), text: 'A' },
            { id: partyActionIdentifier.parse(2), text: 'B' },
            { id: partyActionIdentifier.parse(3), text: 'C' },
            { id: partyActionIdentifier.parse(4), text: 'D' },
          ],
          endsAtEpochMs: 30_000,
          stageId: 101,
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
            stageId: 101,
            stagePosition: 0,
            stageTimeLimitSeconds: 20,
            totalStages: 3,
          },
        },
        gameId: gameIdentifier.parse(9),
        gameType: GameType.Quiz,
        partyId: partyIdentifier.parse(44),
        playerIdentity,
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
      actionId: partyActionIdentifier.parse(2),
      partyId: partyIdentifier.parse(44),
      playerIdentity,
    });

    expect(policyRegistry.resolveByGameType).toHaveBeenCalledWith(GameType.Quiz);
    expect(policy.evaluateSubmission).toHaveBeenCalledWith({
      actionId: partyActionIdentifier.parse(2),
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: 101,
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      gameId: gameIdentifier.parse(9),
      partyId: partyIdentifier.parse(44),
      playerIdentity,
      status: PartyStatus.ACTIVE,
    });
    expect(playerPartyActionRuntime.saveSubmissionResult).toHaveBeenCalledWith({
      actionId: partyActionIdentifier.parse(2),
      context: nextContext,
      partyId: partyIdentifier.parse(44),
      playerIdentity,
      scoreDelta: 750,
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
    });
  });
});
