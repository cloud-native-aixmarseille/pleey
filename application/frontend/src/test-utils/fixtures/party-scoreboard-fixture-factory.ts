import { StageIdentifier } from '../../application/game/party/shared/services/identifiers/stage-identifier';
import type { PartyObservation } from '../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../domains/game/party/shared/entities/party-observation-player';
import { PartyRuntimePhase } from '../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../domains/game/party/shared/entities/party-status';
import { PartyFixtureFactory } from './party-fixture-factory';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

interface ScoreboardObservationOptions {
  readonly partyId?: number;
  readonly stagePosition?: number;
  readonly phase?: PartyRuntimePhase.STAGE | PartyRuntimePhase.RESULT;
  readonly players?: readonly PartyObservationPlayer[];
  readonly submittedPlayerCount?: number;
}

export class PartyScoreboardFixtureFactory {
  createObservation({
    partyId = 9,
    stagePosition = 0,
    phase = PartyRuntimePhase.STAGE,
    players,
    submittedPlayerCount = 0,
  }: ScoreboardObservationOptions = {}): PartyObservation {
    const lifecycle = {
      stageId: new StageIdentifier().parse(coerceUuidV7TestValue(stagePosition + 1)),
      stagePosition,
      stageEndsAtEpochMs: 20_000,
      stageRemainingDurationMs: null,
      stageTimeLimitSeconds: 10,
      totalStages: 5,
    };
    return new PartyFixtureFactory().createPartyObservation({
      partyId,
      players,
      status: PartyStatus.ACTIVE,
      context:
        phase === PartyRuntimePhase.STAGE
          ? {
              lifecycle: { ...lifecycle, phase },
              stage: {
                current: { actions: [], text: 'Question' },
                actionSubmission: {
                  currentPlayer: null,
                  submittedPlayerCount,
                  totalEligiblePlayerCount: players?.length ?? 1,
                },
              },
            }
          : {
              lifecycle: { ...lifecycle, phase },
              result: { current: { actions: [], text: 'Question' }, currentPlayer: null },
            },
    });
  }
}
