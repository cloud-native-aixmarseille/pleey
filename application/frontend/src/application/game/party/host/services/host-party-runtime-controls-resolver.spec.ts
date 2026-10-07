import { describe, expect, it } from 'vitest';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { StageIdentifierMockFactory } from '../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { HostPartyRuntimeControlsResolver } from './host-party-runtime-controls-resolver';

const partyFixtureFactory = new PartyFixtureFactory();
const stageIdentifier = new StageIdentifierMockFactory().create();

describe('HostPartyRuntimeControlsResolver', () => {
  it('enables the start action for waiting lobbies with joined players', () => {
    // Arrange
    const resolver = new HostPartyRuntimeControlsResolver();
    const observation = partyFixtureFactory.createPartyObservation({ isObserverHost: true });

    // Act
    const controls = resolver.resolveControls(observation);

    // Assert
    expect(controls).toEqual(
      expect.objectContaining({
        canEndParty: true,
        canStartParty: true,
        lifecyclePhase: PartyRuntimePhase.LOBBY,
      }),
    );
  });

  it('disables the start action for waiting lobbies without joined players', () => {
    // Arrange
    const resolver = new HostPartyRuntimeControlsResolver();
    const observation = partyFixtureFactory.createPartyObservation({ isObserverHost: true, players: [] });

    // Act
    const controls = resolver.resolveControls(observation);

    // Assert
    expect(controls).toEqual(
      expect.objectContaining({
        canStartParty: false,
        lifecyclePhase: PartyRuntimePhase.LOBBY,
      }),
    );
  });

  it('enables reveal and pause controls during an active stage', () => {
    // Arrange
    const resolver = new HostPartyRuntimeControlsResolver();
    const observation = partyFixtureFactory.createPartyObservation({
      isObserverHost: true,
      status: PartyStatus.ACTIVE,
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: null,
          stageId: stageIdentifier.parse(2),
          stagePosition: 1,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 0,
            totalEligiblePlayerCount: 0,
          },
          current: {
            actions: [],
            text: 'Question 2',
          },
        },
      },
    });

    // Act
    const controls = resolver.resolveControls(observation);

    // Assert
    expect(controls).toEqual(
      expect.objectContaining({
        canPauseParty: true,
        canRestartStage: true,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        currentStageNumber: 2,
        hasNextStage: true,
        lifecyclePhase: PartyRuntimePhase.STAGE,
      }),
    );
  });

  it('enables resume and advance controls for paused results', () => {
    // Arrange
    const resolver = new HostPartyRuntimeControlsResolver();
    const observation = partyFixtureFactory.createPartyObservation({
      isObserverHost: true,
      status: PartyStatus.PAUSED,
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: null,
          stageId: stageIdentifier.parse(3),
          stagePosition: 2,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 3,
        },
        result: {
          current: {
            actions: [],
            text: 'Question 3',
          },
          currentPlayer: null,
        },
      },
    });

    // Act
    const controls = resolver.resolveControls(observation);

    // Assert
    expect(controls).toEqual(
      expect.objectContaining({
        canAdvanceStage: false,
        canPauseParty: false,
        canResumeParty: true,
        currentStageNumber: 3,
        hasNextStage: false,
        isPaused: true,
        lifecyclePhase: PartyRuntimePhase.RESULT,
      }),
    );
  });
});
