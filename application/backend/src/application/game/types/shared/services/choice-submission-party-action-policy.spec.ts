import { describe, expect, it, vi } from 'vitest';
import { GameValidationFailedError, PartyCommandNotAvailableError } from '../../../../../domain/game/errors';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { ChoiceSubmissionFixtureFactory } from '../../../../../test-utils/fixtures/choice-submission-fixture-factory';
import type { PartyStageCatalogPort } from '../ports/party-stage-catalog.port';
import { ChoiceSubmissionPartyActionPolicy } from './choice-submission-party-action-policy';

const fixtures = new ChoiceSubmissionFixtureFactory();

describe('ChoiceSubmissionPartyActionPolicy', () => {
  it.each([
    { points: 1000, now: 10_000, action: 1, expected: 1000 },
    { points: 1000, now: 15_000, action: 1, expected: 900 },
    { points: 1000, now: 19_900, action: 1, expected: 802 },
    { points: 1000, now: 19_999, action: 1, expected: 800 },
    { points: 1000, now: 5_000, action: 1, expected: 1000 },
    { points: 1000, now: 15_000, action: 2, expected: 0 },
    { points: 1000, now: 15_000, action: 3, expected: 900 },
    { points: 0, now: 15_000, action: 1, expected: 0 },
    { points: -10, now: 15_000, action: 1, expected: 0 },
    { points: 1, now: 19_999, action: 1, expected: 1 },
    { points: 3, now: 15_000, action: 1, expected: 3 },
    { points: 3, now: 15_001, action: 1, expected: 2 },
    { points: 8, now: 17_500, action: 1, expected: 7 },
  ])(
    'awards $expected for action $action on a $points-point stage at $now ms',
    async ({ points, now, action, expected }) => {
      // Arrange
      const command = fixtures.createCommand({ actionIds: [backendTestIdentifiers.partyAction(action)] });
      const catalog = {
        findStageById: vi.fn().mockResolvedValue(fixtures.createStage({ points })),
      } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
      try {
        // Act
        const resolution = await policy.evaluateSubmission(command);
        // Assert
        expect(resolution).toEqual({
          context: command.context,
          isCorrect: action !== 2,
          scoreDelta: expected,
          status: PartyStatus.ACTIVE,
        });
      } finally {
        clock.mockRestore();
      }
    },
  );

  it.each([
    { action: 1, points: 1000, now: 20_000 },
    { action: 2, points: 1000, now: 20_000 },
    { action: 1, points: 0, now: 20_001 },
  ])('rejects expired action $action even with $points stage points', async ({ action, points, now }) => {
    // Arrange
    const command = fixtures.createCommand({ actionIds: [backendTestIdentifiers.partyAction(action)] });
    const catalog = {
      findStageById: vi.fn().mockResolvedValue(fixtures.createStage({ points })),
    } as unknown as PartyStageCatalogPort;
    const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    try {
      // Act + Assert
      await expect(policy.evaluateSubmission(command)).rejects.toThrow(PartyCommandNotAvailableError);
    } finally {
      clock.mockRestore();
    }
  });

  it.each([
    { action: 1, expected: 1000 },
    { action: 2, expected: 0 },
  ])('awards $expected for untimed action $action', async ({ action, expected }) => {
    // Arrange
    const command = fixtures.createCommand({
      actionIds: [backendTestIdentifiers.partyAction(action)],
      context: fixtures.createContext({ stageTimeLimitSeconds: 0, stageEndsAtEpochMs: null }),
    });
    const catalog = {
      findStageById: vi.fn().mockResolvedValue(fixtures.createStage()),
    } as unknown as PartyStageCatalogPort;
    const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
    // Act
    const resolution = await policy.evaluateSubmission(command);
    // Assert
    expect(resolution.scoreDelta).toBe(expected);
  });

  it.each([PartyStatus.PAUSED, PartyStatus.ENDED, PartyStatus.WAITING])(
    'rejects submissions while %s',
    async (status) => {
      // Arrange
      const catalog = { findStageById: vi.fn() } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      // Act + Assert
      await expect(policy.evaluateSubmission(fixtures.createCommand({ status }))).rejects.toThrow(
        PartyCommandNotAvailableError,
      );
      expect(catalog.findStageById).not.toHaveBeenCalled();
    },
  );

  it.each([
    { actions: [1], now: 15_000, timed: false, expected: 500, isCorrect: false },
    { actions: [1, 2], now: 15_000, timed: false, expected: 0, isCorrect: false },
    { actions: [1, 3], now: 15_000, timed: false, expected: 1000, isCorrect: true },
    { actions: [1], now: 15_000, timed: true, expected: 450, isCorrect: false },
    { actions: [1, 3], now: 15_000, timed: true, expected: 900, isCorrect: true },
    { actions: [1, 2, 3], now: 15_000, timed: true, expected: 450, isCorrect: false },
    { actions: [2], now: 15_000, timed: true, expected: 0, isCorrect: false },
    { actions: [1], now: 19_999, timed: true, expected: 400, isCorrect: false },
  ])(
    'awards $expected for multi-select $actions at $now ms (timed: $timed)',
    async ({ actions, now, timed, expected, isCorrect }) => {
      // Arrange
      const command = fixtures.createCommand({
        actionIds: actions.map((action) => backendTestIdentifiers.partyAction(action)),
        context: fixtures.createContext(timed ? {} : { stageTimeLimitSeconds: 0, stageEndsAtEpochMs: null }),
      });
      const catalog = {
        findStageById: vi.fn().mockResolvedValue(fixtures.createStage({ allowsMultipleSelections: true })),
      } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
      try {
        // Act
        const resolution = await policy.evaluateSubmission(command);
        // Assert
        expect(resolution).toEqual({
          context: command.context,
          isCorrect,
          scoreDelta: expected,
          status: PartyStatus.ACTIVE,
        });
      } finally {
        clock.mockRestore();
      }
    },
  );

  it.each([
    { actions: [], allowsMultipleSelections: true },
    { actions: [1, 1], allowsMultipleSelections: true },
    { actions: [4], allowsMultipleSelections: true },
    { actions: [1, 3], allowsMultipleSelections: false },
  ])(
    'rejects invalid selections $actions (multi-select: $allowsMultipleSelections)',
    async ({ actions, allowsMultipleSelections }) => {
      // Arrange
      const catalog = {
        findStageById: vi.fn().mockResolvedValue(fixtures.createStage({ allowsMultipleSelections })),
      } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      const command = fixtures.createCommand({
        actionIds: actions.map((action) => backendTestIdentifiers.partyAction(action)),
      });
      // Act + Assert
      await expect(policy.evaluateSubmission(command)).rejects.toThrow(GameValidationFailedError);
    },
  );
});

describe('Question reading submission timing', () => {
  it.each([
    { actions: [1], points: 1000, timeLimit: 10 },
    { actions: [2], points: 1000, timeLimit: 10 },
    { actions: [1], points: 0, timeLimit: 10 },
    { actions: [1], points: 1000, timeLimit: 0 },
    { actions: [1, 3], points: 1000, timeLimit: 10 },
    { actions: [1, 3], points: 1000, timeLimit: 0 },
  ])(
    'rejects selections $actions on a $points-point stage before reading ends (limit $timeLimit)',
    async ({ actions, points, timeLimit }) => {
      // Arrange
      const clock = vi.spyOn(Date, 'now').mockReturnValue(12_999);
      const catalog = {
        findStageById: vi
          .fn()
          .mockResolvedValue(fixtures.createStage({ points, allowsMultipleSelections: actions.length > 1 })),
      } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      const command = fixtures.createCommand({
        actionIds: actions.map((action) => backendTestIdentifiers.partyAction(action)),
        context: fixtures.createContext({
          reading: { endsAtEpochMs: 13_000, remainingDurationMs: 3_000 },
          stageEndsAtEpochMs: timeLimit === 0 ? null : 23_000,
          stageTimeLimitSeconds: timeLimit,
        }),
      });
      try {
        // Act + Assert
        await expect(policy.evaluateSubmission(command)).rejects.toThrow(PartyCommandNotAvailableError);
      } finally {
        clock.mockRestore();
      }
    },
  );

  it.each([
    { now: 13_000, timeLimit: 10, expected: 1000 },
    { now: 18_000, timeLimit: 10, expected: 900 },
    { now: 13_000, timeLimit: 0, expected: 1000 },
  ])('awards $expected at $now after reading (limit $timeLimit)', async ({ now, timeLimit, expected }) => {
    // Arrange
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    const catalog = {
      findStageById: vi.fn().mockResolvedValue(fixtures.createStage()),
    } as unknown as PartyStageCatalogPort;
    const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
    const command = fixtures.createCommand({
      context: fixtures.createContext({
        reading: { endsAtEpochMs: 13_000, remainingDurationMs: 3_000 },
        stageEndsAtEpochMs: timeLimit === 0 ? null : 23_000,
        stageTimeLimitSeconds: timeLimit,
      }),
    });
    try {
      // Act
      const result = await policy.evaluateSubmission(command);
      // Assert
      expect(result.scoreDelta).toBe(expected);
    } finally {
      clock.mockRestore();
    }
  });
});
