import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyScoreboardFixtureFactory } from '../../../../../test-utils/fixtures/party-scoreboard-fixture-factory';
import { updatePartyStageScoreboard } from '../contexts/party-stage-scoreboard.model';
import { PartyStageScoreboardContext } from '../contexts/party-stage-scoreboard-context';
import { usePartyStageScoreboardSnapshot } from './use-party-stage-scoreboard-snapshot';

const fixtures = new PartyScoreboardFixtureFactory();

describe('usePartyStageScoreboardSnapshot', () => {
  it('reads the same baseline when a result panel remounts', () => {
    // Arrange
    const stage = fixtures.createObservation();
    const result = fixtures.createObservation({ phase: PartyRuntimePhase.RESULT });
    const snapshot = updatePartyStageScoreboard(updatePartyStageScoreboard(null, stage), result);
    const wrapper = ({ children }: PropsWithChildren) => (
      <PartyStageScoreboardContext.Provider value={snapshot}>{children}</PartyStageScoreboardContext.Provider>
    );
    // Act
    const first = renderHook(() => usePartyStageScoreboardSnapshot(result), { wrapper });
    const firstBaseline = first.result.current.previousPlayers;
    first.unmount();
    const remounted = renderHook(() => usePartyStageScoreboardSnapshot(result), { wrapper });
    // Assert
    expect(remounted.result.current.previousPlayers).toBe(firstBaseline);
    expect(remounted.result.current.previousPlayers).toEqual(stage.players);
  });

  it.each([
    { partyId: 10, stagePosition: 0 },
    { partyId: 9, stagePosition: 1 },
  ])('ignores snapshots belonging to another party or stage: $partyId / $stagePosition', (options) => {
    // Arrange
    const stage = fixtures.createObservation();
    const snapshot = updatePartyStageScoreboard(
      updatePartyStageScoreboard(null, stage),
      fixtures.createObservation({ phase: PartyRuntimePhase.RESULT }),
    );
    const result = fixtures.createObservation({ ...options, phase: PartyRuntimePhase.RESULT });
    const wrapper = ({ children }: PropsWithChildren) => (
      <PartyStageScoreboardContext.Provider value={snapshot}>{children}</PartyStageScoreboardContext.Provider>
    );
    // Act
    const rendered = renderHook(() => usePartyStageScoreboardSnapshot(result), { wrapper });
    // Assert
    expect(rendered.result.current).toEqual({ players: result.players, previousPlayers: undefined });
  });
});
