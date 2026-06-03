import { afterEach, describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { GameErrorCode } from '../../../enums/game-error-code.enum';
import { PartyStatus } from '../../enums/party-status.enum';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../shared/entities/party-runtime-context';
import { HostPartyLifecyclePolicy } from './host-party-lifecycle-policy';

function createRuntimeContext(
  overrides: Partial<
    Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.STAGE } }>['lifecycle']
  > = {},
): Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.STAGE } }> {
  return {
    lifecycle: {
      phase: PartyRuntimePhase.STAGE,
      stageEndsAtEpochMs: 120_000,
      stageRemainingDurationMs: 20_000,
      stageId: backendTestIdentifiers.partyStage(101),
      stagePosition: 0,
      stageTimeLimitSeconds: 20,
      totalStages: 3,
      ...overrides,
    },
  };
}

function createResultRuntimeContext(
  overrides: Partial<
    Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.RESULT } }>['lifecycle']
  > = {},
): Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.RESULT } }> {
  return {
    lifecycle: {
      phase: PartyRuntimePhase.RESULT,
      stageEndsAtEpochMs: 120_000,
      stageRemainingDurationMs: 20_000,
      stageId: backendTestIdentifiers.partyStage(101),
      stagePosition: 0,
      stageTimeLimitSeconds: 20,
      totalStages: 3,
      ...overrides,
    },
  };
}

describe('HostPartyLifecyclePolicy', () => {
  const policy = new HostPartyLifecyclePolicy();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts a waiting party on the first stage', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const result = policy.start(
      {
        status: PartyStatus.WAITING,
        runtime: null,
      },
      {
        firstStage: {
          id: backendTestIdentifiers.partyStage(101),
          stagePosition: 0,
          timeLimitSeconds: 20,
        },
        totalStages: 4,
      },
    );

    expect(result).toEqual({
      status: PartyStatus.ACTIVE,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 120_000,
          stageRemainingDurationMs: 20_000,
          stageId: backendTestIdentifiers.partyStage(101),
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      },
    });
  });

  it('rejects starting a party without configured stages', () => {
    expect(() =>
      policy.start(
        {
          status: PartyStatus.WAITING,
          runtime: null,
        },
        {
          firstStage: null,
          totalStages: 0,
        },
      ),
    ).toThrow(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
  });

  it('reveals the current stage result', () => {
    const result = policy.revealStageResult({
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext(),
    });

    expect(result.runtime?.lifecycle.phase).toBe(PartyRuntimePhase.RESULT);
    expect(result.runtime?.lifecycle.stageId).toBe(backendTestIdentifiers.partyStage(101));
    expect(result.runtime?.lifecycle.stagePosition).toBe(0);
  });

  it('advances to the next stage after a result', () => {
    vi.spyOn(Date, 'now').mockReturnValue(200_000);

    const result = policy.advanceStage(
      {
        status: PartyStatus.ACTIVE,
        runtime: createResultRuntimeContext({
          stageId: backendTestIdentifiers.partyStage(102),
          stagePosition: 1,
        }),
      },
      {
        nextStage: {
          id: backendTestIdentifiers.partyStage(103),
          stagePosition: 2,
          timeLimitSeconds: 15,
        },
      },
    );

    expect(result).toEqual({
      status: PartyStatus.ACTIVE,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 215_000,
          stageRemainingDurationMs: 15_000,
          stageId: backendTestIdentifiers.partyStage(103),
          stagePosition: 2,
          stageTimeLimitSeconds: 15,
          totalStages: 3,
        },
      },
    });
  });

  it('ends the party after advancing beyond the final result', () => {
    const result = policy.advanceStage(
      {
        status: PartyStatus.ACTIVE,
        runtime: {
          ...createResultRuntimeContext({
            stageId: backendTestIdentifiers.partyStage(103),
            stagePosition: 2,
          }),
          result: {
            current: {
              actions: [
                {
                  actionCount: 1,
                  actionPercent: 100,
                  earnedPoints: 1000,
                  id: backendTestIdentifiers.partyAction(1),
                  isCorrect: true,
                  text: 'A',
                },
              ],
              text: 'Question 3',
            },
            currentPlayer: null,
          },
        },
      },
      {
        nextStage: null,
      },
    );

    expect(result).toEqual({
      status: PartyStatus.ENDED,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.ENDED,
          stageEndsAtEpochMs: 120_000,
          stageRemainingDurationMs: 20_000,
          stageId: backendTestIdentifiers.partyStage(103),
          stagePosition: 2,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
        result: {
          current: {
            actions: [
              {
                actionCount: 1,
                actionPercent: 100,
                earnedPoints: 1000,
                id: backendTestIdentifiers.partyAction(1),
                isCorrect: true,
                text: 'A',
              },
            ],
            text: 'Question 3',
          },
          currentPlayer: null,
        },
      },
    });
  });

  it('rewinds to the lobby while preserving configured stage count', () => {
    const result = policy.rewindParty({
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext({
        stageId: backendTestIdentifiers.partyStage(102),
        stagePosition: 1,
      }),
    });

    expect(result).toEqual({
      status: PartyStatus.WAITING,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.LOBBY,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: null,
          stagePosition: null,
          stageTimeLimitSeconds: null,
          totalStages: 3,
        },
      },
    });
  });

  it('pauses and resumes an in-progress party', () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(110_000).mockReturnValueOnce(130_000);

    const paused = policy.pause({
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext({
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs: 120_000,
        stageRemainingDurationMs: 20_000,
        stageId: backendTestIdentifiers.partyStage(102),
        stagePosition: 1,
      }),
    });
    const resumed = policy.resume(paused);

    expect(paused.status).toBe(PartyStatus.PAUSED);
    expect(resumed.status).toBe(PartyStatus.ACTIVE);
    expect(paused.runtime?.lifecycle.stageEndsAtEpochMs).toBeNull();
    expect(paused.runtime?.lifecycle.stageRemainingDurationMs).toBe(10_000);
    expect(resumed.runtime?.lifecycle.stageEndsAtEpochMs).toBe(140_000);
    expect(resumed.runtime?.lifecycle.stageRemainingDurationMs).toBe(10_000);
  });

  it('rejects rewinding before the first stage', () => {
    expect(() =>
      policy.rewindStage(
        {
          status: PartyStatus.ACTIVE,
          runtime: createRuntimeContext({
            stageId: backendTestIdentifiers.partyStage(101),
            stagePosition: 0,
          }),
        },
        {
          previousStage: null,
        },
      ),
    ).toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
  });
});
