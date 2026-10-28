import { describe, expect, it, vi } from 'vitest';
import { PartyCommandNotAvailableError } from '../../../../../domain/game/errors';
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
      const command = fixtures.createCommand({ actionId: backendTestIdentifiers.partyAction(action) });
      const catalog = {
        findStageById: vi.fn().mockResolvedValue(fixtures.createStage({ points })),
      } as unknown as PartyStageCatalogPort;
      const policy = new ChoiceSubmissionPartyActionPolicy(catalog);
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
      try {
        // Act
        const resolution = await policy.evaluateSubmission(command);
        // Assert
        expect(resolution).toEqual({ context: command.context, scoreDelta: expected, status: PartyStatus.ACTIVE });
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
    const command = fixtures.createCommand({ actionId: backendTestIdentifiers.partyAction(action) });
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
    const timed = fixtures.createCommand();
    if (!timed.context) throw new Error('The timed submission fixture requires a runtime context');
    const command = fixtures.createCommand({
      actionId: backendTestIdentifiers.partyAction(action),
      context: { lifecycle: { ...timed.context.lifecycle, stageTimeLimitSeconds: 0, stageEndsAtEpochMs: null } },
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
});
