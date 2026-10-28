import { Inject, Injectable } from '@nestjs/common';
import {
  GameValidationFailedError,
  PartyCommandNotAvailableError,
  PartyStagesNotAvailableError,
} from '../../../../../domain/game/errors';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import {
  type EvaluatePartyActionSubmissionCommand,
  GameTypePartyActionPolicy,
  type PartyActionSubmissionResolution,
} from '../ports/game-type-party-action-policy-registry.port';
import { PartyStageCatalogPort } from '../ports/party-stage-catalog.port';

const SPEED_BONUS_SHARE = 0.2;

@Injectable()
export class ChoiceSubmissionPartyActionPolicy extends GameTypePartyActionPolicy {
  constructor(
    @Inject(PartyStageCatalogPort)
    private readonly partyStageCatalog: PartyStageCatalogPort,
  ) {
    super();
  }

  async evaluateSubmission(command: EvaluatePartyActionSubmissionCommand): Promise<PartyActionSubmissionResolution> {
    const stageId = command.context?.lifecycle.stageId;

    if (
      command.status !== PartyStatus.ACTIVE ||
      command.context?.lifecycle.phase !== PartyRuntimePhase.STAGE ||
      stageId == null
    ) {
      throw new PartyCommandNotAvailableError({
        actionId: command.actionId,
        gameId: command.gameId,
        phase: command.context?.lifecycle.phase,
        stageId,
        status: command.status,
      });
    }

    const stage = await this.partyStageCatalog.findStageById(command.gameId, stageId);

    if (!stage) {
      throw new PartyStagesNotAvailableError({
        gameId: command.gameId,
        stageId,
      });
    }

    const selectedAction = stage.actions.find((action) => action.id === command.actionId);

    if (!selectedAction) {
      throw new GameValidationFailedError({
        actionId: command.actionId,
        gameId: command.gameId,
        reason: 'actionNotFoundInStage',
        stageId,
      });
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
    const totalDurationMs = (command.context?.lifecycle.stageTimeLimitSeconds ?? 0) * 1_000;
    const stageEndsAtEpochMs = command.context?.lifecycle.stageEndsAtEpochMs ?? null;
    const remainingDurationMs = stageEndsAtEpochMs === null ? null : stageEndsAtEpochMs - Date.now();

    if (remainingDurationMs !== null && remainingDurationMs <= 0) {
      throw new PartyCommandNotAvailableError({
        actionId: command.actionId,
        gameId: command.gameId,
        reason: 'stageExpired',
        remainingDurationMs,
        stageEndsAtEpochMs,
        stageId: command.context?.lifecycle.stageId,
      });
    }

    if (!isCorrect || stagePoints <= 0) {
      return 0;
    }

    if (totalDurationMs <= 0 || remainingDurationMs === null) {
      return stagePoints;
    }

    const speedBonusCap = Math.round(stagePoints * SPEED_BONUS_SHARE);
    const correctAnswerPoints = stagePoints - speedBonusCap;
    const speedRatio = Math.min(1, Math.max(0, remainingDurationMs / totalDurationMs));

    return correctAnswerPoints + Math.round(speedBonusCap * speedRatio);
  }
}
