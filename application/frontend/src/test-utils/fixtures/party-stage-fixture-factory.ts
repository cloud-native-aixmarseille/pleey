import type { PartyObservation } from '../../domains/game/party/shared/entities/party-observation';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../domains/game/party/shared/entities/party-status';
import { PartyActionIdentifierMockFactory } from '../mocks/party-action-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../mocks/stage-identifier-mock-factory';
import { PartyFixtureFactory } from './party-fixture-factory';

type StageLifecycle = Extract<PartyRuntimeContext, { lifecycle: { phase: PartyRuntimePhase.STAGE } }>['lifecycle'];

export class PartyStageFixtureFactory {
  createObservation(
    lifecycle: Partial<StageLifecycle> = {},
    overrides: Partial<PartyObservation> = {},
  ): PartyObservation {
    const actionIdentifier = new PartyActionIdentifierMockFactory().create();
    return new PartyFixtureFactory().createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          reading: { endsAtEpochMs: 103_000, remainingDurationMs: 3_000 },
          stageEndsAtEpochMs: 123_000,
          stageRemainingDurationMs: 20_000,
          stageId: new StageIdentifierMockFactory().create().parse(1),
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
          ...lifecycle,
        },
        stage: {
          current: {
            text: 'Which answer?',
            actions: [
              { id: actionIdentifier.parse(1), text: 'First answer' },
              { id: actionIdentifier.parse(2), text: 'Second answer' },
            ],
          },
          actionSubmission: { currentPlayer: null, submittedPlayerCount: 0, totalEligiblePlayerCount: 1 },
        },
      },
      ...overrides,
    });
  }
}
