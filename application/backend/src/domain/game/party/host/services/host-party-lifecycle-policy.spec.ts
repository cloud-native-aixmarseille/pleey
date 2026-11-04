import { describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { GameErrorCode } from '../../../enums/game-error-code.enum';
import { PartyStatus } from '../../enums/party-status.enum';
import { type PartyRuntimeContext, PartyRuntimePhase } from '../../shared/entities/party-runtime-context';
import { HostPartyDisabledReason } from '../value-objects/host-party-permissions';
import { HostPartyLifecyclePolicy } from './host-party-lifecycle-policy';

function createRuntimeContext(
  overrides: Partial<Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.STAGE } }>['lifecycle']> = {},
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

  it('uses the same denied decision for an empty lobby and the start command', () => {
    // Arrange
    const state = { status: PartyStatus.WAITING, playerCount: 0, stageCount: 1, runtime: null };
    // Act
    const permission = policy.permissions(state).startParty;
    // Assert
    expect(permission).toEqual({ allowed: false, reason: HostPartyDisabledReason.NO_PLAYERS });
    expect(() =>
      policy.start(state, {
        firstStage: { id: backendTestIdentifiers.partyStage(101), stagePosition: 0, timeLimitSeconds: 20 },
        totalStages: 1,
      }),
    ).toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
  });

  it('denies starting when required availability facts are missing', () => {
    // Arrange
    const state = { status: PartyStatus.WAITING, playerCount: 1, runtime: null };
    // Act + Assert
    expect(policy.permissions(state).startParty).toEqual({ allowed: false, reason: HostPartyDisabledReason.NO_STAGES });
  });

  it('starts a waiting party on the first stage', () => {
    // Arrange + Act
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(100_000);

    // Assert
    try {
      const result = policy.start(
        {
          playerCount: 1,
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
            reading: { endsAtEpochMs: 103_000, remainingDurationMs: 3_000 },
            stageEndsAtEpochMs: 123_000,
            stageRemainingDurationMs: 20_000,
            stageId: backendTestIdentifiers.partyStage(101),
            stagePosition: 0,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('rejects starting a party without configured stages', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.start(
        {
          playerCount: 1,
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
    // Arrange + Act
    const result = policy.revealStageResult({
      playerCount: 1,
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext(),
    });

    // Assert
    expect(result.runtime?.lifecycle.phase).toBe(PartyRuntimePhase.RESULT);
    expect(result.runtime?.lifecycle.stageId).toBe(backendTestIdentifiers.partyStage(101));
    expect(result.runtime?.lifecycle.stagePosition).toBe(0);
  });

  it('advances to the next stage after a result', () => {
    // Arrange + Act
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(200_000);

    // Assert
    try {
      const result = policy.advanceStage(
        {
          playerCount: 1,
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
            reading: { endsAtEpochMs: 203_000, remainingDurationMs: 3_000 },
            stageEndsAtEpochMs: 218_000,
            stageRemainingDurationMs: 15_000,
            stageId: backendTestIdentifiers.partyStage(103),
            stagePosition: 2,
            stageTimeLimitSeconds: 15,
            totalStages: 3,
          },
        },
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('ends the party after advancing beyond the final result', () => {
    // Arrange + Act
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

    // Assert
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
    // Arrange + Act
    const result = policy.rewindParty({
      playerCount: 1,
      status: PartyStatus.ACTIVE,
      runtime: createRuntimeContext({
        stageId: backendTestIdentifiers.partyStage(102),
        stagePosition: 1,
      }),
    });

    // Assert
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
    // Arrange + Act
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValueOnce(110_000).mockReturnValueOnce(130_000);

    // Assert
    try {
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
      const resumed = policy.resume({ ...paused, playerCount: 1 });

      expect(paused.status).toBe(PartyStatus.PAUSED);
      expect(resumed.status).toBe(PartyStatus.ACTIVE);
      expect(paused.runtime?.lifecycle.stageEndsAtEpochMs).toBeNull();
      expect(paused.runtime?.lifecycle.stageRemainingDurationMs).toBe(10_000);
      expect(resumed.runtime?.lifecycle.stageEndsAtEpochMs).toBe(140_000);
      expect(resumed.runtime?.lifecycle.stageRemainingDurationMs).toBe(10_000);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('rejects rewinding before the first stage', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.rewindStage(
        {
          playerCount: 1,
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

describe('Question reading lifecycle', () => {
  it.each([
    { readingSeconds: 0, timeLimit: 20, expectedDeadline: 120_000, expectedReading: undefined },
    {
      readingSeconds: 5,
      timeLimit: 20,
      expectedDeadline: 125_000,
      expectedReading: { endsAtEpochMs: 105_000, remainingDurationMs: 5_000 },
    },
    {
      readingSeconds: 30,
      timeLimit: 0,
      expectedDeadline: null,
      expectedReading: { endsAtEpochMs: 130_000, remainingDurationMs: 30_000 },
    },
  ])(
    'starts with $readingSeconds seconds of reading and a $timeLimit-second answer window',
    ({ readingSeconds, timeLimit, expectedDeadline, expectedReading }) => {
      // Arrange
      const policy = new HostPartyLifecyclePolicy();
      const clock = vi.spyOn(Date, 'now').mockReturnValue(100_000);
      try {
        // Act
        const result = policy.start(
          { playerCount: 1, status: PartyStatus.WAITING, runtime: null, questionReadingTimeSeconds: readingSeconds },
          {
            firstStage: { id: backendTestIdentifiers.partyStage(101), stagePosition: 0, timeLimitSeconds: timeLimit },
            totalStages: 3,
          },
        );
        // Assert
        expect(result.runtime?.lifecycle.stageEndsAtEpochMs).toBe(expectedDeadline);
        expect(result.runtime?.lifecycle.reading).toEqual(expectedReading);
      } finally {
        clock.mockRestore();
      }
    },
  );

  it.each([
    { pauseAt: 101_000, timeLimit: 20, remainingReading: 2_000, remainingAnswering: 20_000, deadline: 222_000 },
    { pauseAt: 110_000, timeLimit: 20, remainingReading: 0, remainingAnswering: 13_000, deadline: 213_000 },
    { pauseAt: 101_000, timeLimit: 0, remainingReading: 2_000, remainingAnswering: null, deadline: null },
  ])(
    'preserves reading and answering time when pausing at $pauseAt (limit $timeLimit)',
    ({ pauseAt, timeLimit, remainingReading, remainingAnswering, deadline }) => {
      // Arrange
      const policy = new HostPartyLifecyclePolicy();
      const clock = vi.spyOn(Date, 'now').mockReturnValue(pauseAt);
      const runtime = createRuntimeContext({
        reading: { endsAtEpochMs: 103_000, remainingDurationMs: 3_000 },
        stageEndsAtEpochMs: timeLimit === 0 ? null : 123_000,
        stageTimeLimitSeconds: timeLimit,
        stageRemainingDurationMs: timeLimit === 0 ? null : 20_000,
      });
      try {
        // Act
        const paused = policy.pause({ playerCount: 1, status: PartyStatus.ACTIVE, runtime });
        clock.mockReturnValue(200_000);
        const resumed = policy.resume({ ...paused, playerCount: 1 });
        // Assert
        expect(paused.runtime?.lifecycle).toMatchObject({
          reading: { endsAtEpochMs: null, remainingDurationMs: remainingReading },
          stageRemainingDurationMs: remainingAnswering,
          stageEndsAtEpochMs: null,
        });
        expect(resumed.runtime?.lifecycle).toMatchObject({
          reading: { endsAtEpochMs: 200_000 + remainingReading, remainingDurationMs: remainingReading },
          stageEndsAtEpochMs: deadline,
        });
      } finally {
        clock.mockRestore();
      }
    },
  );

  it.each(['restart', 'rewind', 'advance'] as const)(
    'keeps a fresh reading period frozen when using %s while paused',
    (command) => {
      // Arrange
      const policy = new HostPartyLifecyclePolicy();
      const state = {
        playerCount: 1,
        status: PartyStatus.PAUSED,
        questionReadingTimeSeconds: 5,
        runtime: createResultRuntimeContext({ stagePosition: 1 }),
      };
      const stage = { id: backendTestIdentifiers.partyStage(101), stagePosition: 0, timeLimitSeconds: 20 };
      // Act
      const result =
        command === 'restart'
          ? policy.restartStage(state)
          : command === 'rewind'
            ? policy.rewindStage(state, { previousStage: stage })
            : policy.advanceStage(state, { nextStage: stage });
      // Assert
      expect(result.runtime?.lifecycle).toMatchObject({
        reading: { endsAtEpochMs: null, remainingDurationMs: 5_000 },
        stageEndsAtEpochMs: null,
        stageRemainingDurationMs: 20_000,
      });
    },
  );
});
