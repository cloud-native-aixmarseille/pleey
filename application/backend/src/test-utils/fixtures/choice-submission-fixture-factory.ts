import type { EvaluatePartyActionSubmissionCommand } from '../../application/game/types/shared/ports/game-type-party-action-policy-registry.port';
import type { PartyStageCatalogEntry } from '../../application/game/types/shared/ports/party-stage-catalog.port';
import { PartyPlayerKind } from '../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../domain/game/party/shared/entities/party-runtime-context';
import { backendTestIdentifiers } from '../branded-identifiers';

export class ChoiceSubmissionFixtureFactory {
  createCommand(overrides: Partial<EvaluatePartyActionSubmissionCommand> = {}): EvaluatePartyActionSubmissionCommand {
    return {
      actionIds: [backendTestIdentifiers.partyAction(1)],
      gameId: backendTestIdentifiers.game(1),
      partyId: backendTestIdentifiers.party(1),
      playerIdentity: { kind: PartyPlayerKind.USER, userId: backendTestIdentifiers.user(1) },
      status: PartyStatus.ACTIVE,
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageId: backendTestIdentifiers.partyStage(1),
          stagePosition: 0,
          stageEndsAtEpochMs: 20_000,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: 10,
          totalStages: 3,
        },
      },
      ...overrides,
    };
  }

  createStage(overrides: Partial<PartyStageCatalogEntry> = {}): PartyStageCatalogEntry {
    return {
      id: backendTestIdentifiers.partyStage(1),
      stagePosition: 0,
      points: 1000,
      timeLimitSeconds: 10,
      text: 'Choose a correct answer',
      actions: [
        { id: backendTestIdentifiers.partyAction(1), isCorrect: true, text: 'A' },
        { id: backendTestIdentifiers.partyAction(2), isCorrect: false, text: 'B' },
        { id: backendTestIdentifiers.partyAction(3), isCorrect: true, text: 'C' },
      ],
      ...overrides,
    };
  }
}
