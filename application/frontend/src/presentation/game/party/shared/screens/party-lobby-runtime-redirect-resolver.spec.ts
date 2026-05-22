import { describe, expect, it } from 'vitest';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { StageIdentifierMockFactory } from '../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { PartyLobbyRuntimeRedirectResolver } from './party-lobby-runtime-redirect-resolver';
import { PartyScreenSection } from './use-party-lobby-screen-state';

const partyFixtureFactory = new PartyFixtureFactory();
const stageIdentifier = new StageIdentifierMockFactory().create();
const toStageId = (value: number) => stageIdentifier.parse(value);

function createStaleResultBranch() {
  return {
    current: {
      actions: [],
      text: 'Stale result',
    },
    currentPlayer: null,
  };
}

function createTransitionalRuntimeContext(
  context: NonNullable<PartyObservation['context']>,
): PartyObservation['context'] {
  return {
    ...context,
    result: createStaleResultBranch(),
  } as unknown as PartyObservation['context'];
}

describe('PartyLobbyRuntimeRedirectResolver', () => {
  it('redirects paused hosts back to the stage route when stale result data survives a rewind', () => {
    const party = partyFixtureFactory.createPartyObservation({
      context: createTransitionalRuntimeContext({
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: null,
          stageId: toStageId(2),
          stagePosition: 1,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 1,
            totalEligiblePlayerCount: 2,
          },
          current: {
            actions: [],
            text: 'Stage 2',
          },
        },
      }),
      status: PartyStatus.PAUSED,
    });

    const redirectTo = PartyLobbyRuntimeRedirectResolver.resolve({
      party,
      requestedStageId: toStageId(2),
      resolvePartyLeaderboardRoute: (partyId) => `/party/${partyId}/final`,
      resolvePartyLobbyRoute: (partyId) => `/party/${partyId}/lobby`,
      resolvePartyResultRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}/result`,
      resolvePartyStageRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}`,
      screenSection: PartyScreenSection.RESULT,
    });

    expect(redirectTo).toBe('/party/9/stage/2');
  });

  it('redirects waiting hosts back to the lobby when stale result data survives a party rewind', () => {
    const party = partyFixtureFactory.createPartyObservation({
      context: createTransitionalRuntimeContext({
        lifecycle: {
          phase: PartyRuntimePhase.LOBBY,
          stageEndsAtEpochMs: null,
          stageId: null,
          stagePosition: null,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      }),
      status: PartyStatus.WAITING,
    });

    const redirectTo = PartyLobbyRuntimeRedirectResolver.resolve({
      party,
      requestedStageId: toStageId(2),
      resolvePartyLeaderboardRoute: (partyId) => `/party/${partyId}/final`,
      resolvePartyLobbyRoute: (partyId) => `/party/${partyId}/lobby`,
      resolvePartyResultRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}/result`,
      resolvePartyStageRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}`,
      screenSection: PartyScreenSection.RESULT,
    });

    expect(redirectTo).toBe('/party/9/lobby');
  });

  it('keeps valid result routes stable when the lifecycle is still in the result phase', () => {
    const party = partyFixtureFactory.createPartyObservation({
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: null,
          stageId: toStageId(2),
          stagePosition: 1,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
        result: {
          current: {
            actions: [],
            text: 'Live result',
          },
          currentPlayer: null,
        },
      },
      status: PartyStatus.PAUSED,
    });

    const redirectTo = PartyLobbyRuntimeRedirectResolver.resolve({
      party,
      requestedStageId: toStageId(2),
      resolvePartyLeaderboardRoute: (partyId) => `/party/${partyId}/final`,
      resolvePartyLobbyRoute: (partyId) => `/party/${partyId}/lobby`,
      resolvePartyResultRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}/result`,
      resolvePartyStageRoute: (partyId, stageId) => `/party/${partyId}/stage/${stageId}`,
      screenSection: PartyScreenSection.RESULT,
    });

    expect(redirectTo).toBeNull();
  });
});
