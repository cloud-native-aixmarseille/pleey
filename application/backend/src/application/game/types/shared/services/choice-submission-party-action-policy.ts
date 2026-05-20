import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import {
  type EvaluatePartyActionSubmissionCommand,
  GameTypePartyActionPolicy,
  type PartyActionSubmissionResolution,
} from '../ports/game-type-party-action-policy-registry.port';
import { PartyStageCatalogPort } from '../ports/party-stage-catalog.port';

@Injectable()
export class ChoiceSubmissionPartyActionPolicy extends GameTypePartyActionPolicy {
  constructor(
    @Inject(PartyStageCatalogPort)
    private readonly partyStageCatalog: PartyStageCatalogPort,
  ) {
    super();
  }

  async evaluateSubmission(
    command: EvaluatePartyActionSubmissionCommand,
  ): Promise<PartyActionSubmissionResolution> {
    const stageId = command.context?.lifecycle.stageId;

    if (
      command.status !== PartyStatus.ACTIVE ||
      command.context?.lifecycle.phase !== PartyRuntimePhase.STAGE ||
      stageId == null
    ) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    const stage = await this.partyStageCatalog.findStageById(command.gameId, stageId);

    if (!stage) {
      throw new Error(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
    }

    const selectedAction = stage.actions.find((action) => action.id === command.actionId);

    if (!selectedAction) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    return {
      context: command.context,
      scoreDelta: this.resolveScoreDelta(command, stage.points, selectedAction.isCorrect),
      status: PartyStatus.ACTIVE,
    };
  }

  private resolveScoreDelta(
    command: EvaluatePartyActionSubmissionCommand,
    stagePoints: number,
    isCorrect: boolean,
  ): number {
    if (!isCorrect || stagePoints <= 0) {
      return 0;
    }

    const totalDurationMs = (command.context?.lifecycle.stageTimeLimitSeconds ?? 0) * 1_000;
    const stageEndsAtEpochMs = command.context?.lifecycle.stageEndsAtEpochMs ?? null;

    if (totalDurationMs <= 0 || stageEndsAtEpochMs === null) {
      return stagePoints;
    }

    const remainingDurationMs = stageEndsAtEpochMs - Date.now();

    if (remainingDurationMs <= 0) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    const boundedRemainingDurationMs = Math.min(totalDurationMs, remainingDurationMs);

    return Math.max(1, Math.ceil((stagePoints * boundedRemainingDurationMs) / totalDurationMs));
  }
}
