import { describe, expect, it } from 'vitest';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import { UserIdentifier } from '../../../../identity/shared/services/identifiers/user-identifier';
import { PartyIdentifier } from '../../shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../shared/services/identifiers/party-pin-identifier';
import { StageIdentifier } from '../../shared/services/identifiers/stage-identifier';
import { HostPartyRuntimeControlsResolver } from './host-party-runtime-controls-resolver';

const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const stageIdentifier = new StageIdentifier();
const userIdentifier = new UserIdentifier();

function createObservation(overrides: Partial<PartyObservation> = {}): PartyObservation {
  return {
    partyId: partyIdentifier.parse(44),
    gameType: GameType.Quiz,
    pin: partyPinIdentifier.parse('AB12CD'),
    status: PartyStatus.WAITING,
    context: null,
    isObserverHost: true,
    host: {
      avatarUri: null,
      username: 'Host',
    },
    players: [],
    ...overrides,
  };
}

describe('HostPartyRuntimeControlsResolver', () => {
  it('enables the start action for waiting lobbies with joined players', () => {
    const resolver = new HostPartyRuntimeControlsResolver();

    expect(
      resolver.resolveControls(
        createObservation({
          players: [
            {
              avatarUri: null,
              identity: {
                kind: PartyPlayerIdentityKind.User,
                userId: userIdentifier.parse(11),
              },
              isCurrentPlayer: false,
              isLive: true,
              totalScore: 0,
              username: 'Neo',
            },
          ],
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        canEndParty: true,
        canStartParty: true,
        lifecyclePhase: 'lobby',
      }),
    );
  });

  it('disables the start action for waiting lobbies without joined players', () => {
    const resolver = new HostPartyRuntimeControlsResolver();

    expect(resolver.resolveControls(createObservation())).toEqual(
      expect.objectContaining({
        canStartParty: false,
        lifecyclePhase: 'lobby',
      }),
    );
  });

  it('enables reveal and pause controls during an active stage', () => {
    const resolver = new HostPartyRuntimeControlsResolver();

    expect(
      resolver.resolveControls(
        createObservation({
          status: PartyStatus.ACTIVE,
          context: {
            lifecycle: {
              phase: 'stage',
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
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        canPauseParty: true,
        canRestartStage: true,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        currentStageNumber: 2,
        hasNextStage: true,
        lifecyclePhase: 'stage',
      }),
    );
  });

  it('enables resume and advance controls for paused results', () => {
    const resolver = new HostPartyRuntimeControlsResolver();

    expect(
      resolver.resolveControls(
        createObservation({
          status: PartyStatus.PAUSED,
          context: {
            lifecycle: {
              phase: 'result',
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
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        canAdvanceStage: false,
        canPauseParty: false,
        canResumeParty: true,
        currentStageNumber: 3,
        hasNextStage: false,
        isPaused: true,
        lifecyclePhase: 'result',
      }),
    );
  });
});
