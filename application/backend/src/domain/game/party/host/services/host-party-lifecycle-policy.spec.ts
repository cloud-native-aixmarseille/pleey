import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../enums/game-error-code.enum';
import { PartyStatus } from '../../enums/party-status.enum';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../shared/entities/party-runtime-context';
import { HostPartyLifecyclePolicy } from './host-party-lifecycle-policy';

function createRuntimeContext(
  overrides: Partial<PartyRuntimeContext['lifecycle']> = {},
): PartyRuntimeContext {
  return {
    lifecycle: {
      phase: PartyRuntimePhase.STAGE,
      stageId: 101,
      stagePosition: 0,
      totalStages: 3,
      ...overrides,
    },
  };
}

describe('HostPartyLifecyclePolicy', () => {
  const policy = new HostPartyLifecyclePolicy();

  it('starts a waiting party on the first stage', () => {
    const result = policy.start(
      {
        status: PartyStatus.WAITING,
        runtime: null,
      },
      {
        firstStage: {
          id: 101,
          stagePosition: 0,
        },
        totalStages: 4,
      },
    );

    expect(result).toEqual({
      status: PartyStatus.ACTIVE,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageId: 101,
          stagePosition: 0,
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
    expect(result.runtime?.lifecycle.stageId).toBe(101);
    expect(result.runtime?.lifecycle.stagePosition).toBe(0);
  });

  it('advances to the next stage after a result', () => {
    const result = policy.advanceStage(
      {
        status: PartyStatus.ACTIVE,
        runtime: createRuntimeContext({
          phase: PartyRuntimePhase.RESULT,
          stageId: 102,
          stagePosition: 1,
        }),
      },
      {
        nextStage: {
          id: 103,
          stagePosition: 2,
        },
      },
    );

    expect(result).toEqual({
      status: PartyStatus.ACTIVE,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageId: 103,
          stagePosition: 2,
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
          ...createRuntimeContext({
            phase: PartyRuntimePhase.RESULT,
            stageId: 103,
            stagePosition: 2,
          }),
          result: {
            current: {
              actions: [
                {
                  actionCount: 1,
                  actionPercent: 100,
                  earnedPoints: 1000,
                  id: 1,
                  isCorrect: true,
                  text: 'A',
                },
              ],
              stageId: 103,
              stagePosition: 2,
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
          stageId: 103,
          stagePosition: 2,
          totalStages: 3,
        },
        result: {
          current: {
            actions: [
              {
                actionCount: 1,
                actionPercent: 100,
                earnedPoints: 1000,
                id: 1,
                isCorrect: true,
                text: 'A',
              },
            ],
            stageId: 103,
            stagePosition: 2,
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
      runtime: createRuntimeContext({ stageId: 102, stagePosition: 1 }),
    });

    expect(result).toEqual({
      status: PartyStatus.WAITING,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.LOBBY,
          stageId: null,
          stagePosition: null,
          totalStages: 3,
        },
      },
    });
  });

  it('pauses and resumes an in-progress party', () => {
    const paused = policy.pause({
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext({
        phase: PartyRuntimePhase.RESULT,
        stageId: 102,
        stagePosition: 1,
      }),
    });
    const resumed = policy.resume(paused);

    expect(paused.status).toBe(PartyStatus.PAUSED);
    expect(resumed.status).toBe(PartyStatus.ACTIVE);
    expect(resumed.runtime).toEqual(paused.runtime);
  });

  it('rejects rewinding before the first stage', () => {
    expect(() =>
      policy.rewindStage(
        {
          status: PartyStatus.ACTIVE,
          runtime: createRuntimeContext({ stageId: 101, stagePosition: 0 }),
        },
        {
          previousStage: null,
        },
      ),
    ).toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
  });
});
