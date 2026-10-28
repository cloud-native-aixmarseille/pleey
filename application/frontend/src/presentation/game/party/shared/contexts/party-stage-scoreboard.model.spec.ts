import { describe, expect, it } from 'vitest';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { PartyScoreboardFixtureFactory } from '../../../../../test-utils/fixtures/party-scoreboard-fixture-factory';
import { updatePartyStageScoreboard } from './party-stage-scoreboard.model';

const parties = new PartyFixtureFactory();
const fixtures = new PartyScoreboardFixtureFactory();

describe('stage scoreboard observations', () => {
  it('keeps the pre-stage roster and finalized result through submissions and reconnects', () => {
    // Arrange
    const before = fixtures.createObservation({ players: [parties.createObservationPlayer({ totalScore: 1200 })] });
    const during = fixtures.createObservation({
      submittedPlayerCount: 1,
      players: [parties.createObservationPlayer({ totalScore: 2100 })],
    });
    const result = fixtures.createObservation({ phase: PartyRuntimePhase.RESULT, players: during.players });
    const reconnected = fixtures.createObservation({ phase: PartyRuntimePhase.RESULT, players: [] });
    // Act
    const baseline = updatePartyStageScoreboard(null, before);
    const submitted = updatePartyStageScoreboard(baseline, during);
    const completed = updatePartyStageScoreboard(submitted, result);
    const repeated = updatePartyStageScoreboard(completed, reconnected);
    // Assert
    expect(repeated?.previousPlayers).toEqual(before.players);
    expect(repeated?.previousPlayers).toBe(baseline?.previousPlayers);
    expect(repeated?.resultPlayers).toBe(completed?.resultPlayers);
    expect(repeated?.resultPlayers).toEqual(result.players);
  });

  it.each([PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT] as const)(
    'omits the baseline when first observing %s after submissions',
    (phase) => {
      // Arrange
      const observed = fixtures.createObservation({ phase, submittedPlayerCount: 1 });
      const result = fixtures.createObservation({ phase: PartyRuntimePhase.RESULT });
      // Act
      const snapshot = updatePartyStageScoreboard(updatePartyStageScoreboard(null, observed), result);
      // Assert
      expect(snapshot?.previousPlayers).toBeUndefined();
    },
  );

  it.each([
    { partyId: 10, stagePosition: 0 },
    { partyId: 9, stagePosition: 2 },
  ])('does not reuse history for party $partyId stage $stagePosition', (options) => {
    // Arrange
    const initial = updatePartyStageScoreboard(null, fixtures.createObservation());
    // Act
    const snapshot = updatePartyStageScoreboard(
      initial,
      fixtures.createObservation({ ...options, phase: PartyRuntimePhase.RESULT }),
    );
    // Assert
    expect(snapshot?.previousPlayers).toBeUndefined();
  });

  it('captures the actual roster and scores at the next stage', () => {
    // Arrange
    const previous = updatePartyStageScoreboard(null, fixtures.createObservation({ phase: PartyRuntimePhase.RESULT }));
    const next = fixtures.createObservation({
      stagePosition: 1,
      players: [parties.createObservationPlayer({ totalScore: 900, username: 'Renamed' })],
    });
    // Act
    const snapshot = updatePartyStageScoreboard(previous, next);
    // Assert
    expect(snapshot?.previousPlayers).toEqual(next.players);
    expect(snapshot?.resultPlayers).toBeUndefined();
  });

  it.each([PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT] as const)(
    'recaptures reset scores when restarting from %s',
    (phase) => {
      // Arrange
      const previous = updatePartyStageScoreboard(
        null,
        fixtures.createObservation({
          phase,
          submittedPlayerCount: 1,
          players: [parties.createObservationPlayer({ totalScore: 900 })],
        }),
      );
      const restarted = fixtures.createObservation({ players: [parties.createObservationPlayer({ totalScore: 0 })] });
      // Act
      const snapshot = updatePartyStageScoreboard(previous, restarted);
      // Assert
      expect(snapshot?.previousPlayers).toEqual(restarted.players);
      expect(snapshot?.resultPlayers).toBeUndefined();
    },
  );

  it('clears snapshots on returning to the lobby', () => {
    // Arrange
    const previous = updatePartyStageScoreboard(null, fixtures.createObservation());
    // Act
    const snapshot = updatePartyStageScoreboard(previous, parties.createPartyObservation());
    // Assert
    expect(snapshot).toBeNull();
  });
});
