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
import { type PartyStageCatalogEntry, PartyStageCatalogPort } from '../ports/party-stage-catalog.port';

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
        actionIds: command.actionIds,
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

    const selectedActionIds = new Set(command.actionIds);
    const selectedActions = stage.actions.filter((action) => selectedActionIds.has(action.id));

    if (
      command.actionIds.length === 0 ||
      selectedActionIds.size !== command.actionIds.length ||
      selectedActions.length !== command.actionIds.length ||
      (!stage.allowsMultipleSelections && command.actionIds.length !== 1)
    ) {
      throw new GameValidationFailedError({
        actionIds: command.actionIds,
        gameId: command.gameId,
        reason: 'invalidActionSelection',
        stageId,
      });
    }

    const correctActionCount = stage.actions.filter((action) => action.isCorrect).length;
    const selectedCorrectActionCount = selectedActions.filter((action) => action.isCorrect).length;
    const isCorrect =
      selectedCorrectActionCount === correctActionCount &&
      selectedActions.length === command.actionIds.length &&
      selectedActions.length === correctActionCount;

    return {
      context: command.context,
      isCorrect: stage.allowsMultipleSelections ? isCorrect : selectedActions[0]?.isCorrect === true,
      scoreDelta: this.resolveScoreDelta(
        command,
        stage.points,
        stage.allowsMultipleSelections
          ? this.resolveMultiSelectCorrectness(stage.actions, selectedActions)
          : selectedActions[0]?.isCorrect === true,
      ),
      status: PartyStatus.ACTIVE,
    };
  }

  private resolveMultiSelectCorrectness(
    actions: PartyStageCatalogEntry['actions'],
    selectedActions: PartyStageCatalogEntry['actions'],
  ): number {
    const correctActionCount = actions.filter((action) => action.isCorrect).length;
    const selectedCorrectActionCount = selectedActions.filter((action) => action.isCorrect).length;
    const selectedIncorrectActionCount = selectedActions.length - selectedCorrectActionCount;

    return correctActionCount > 0
      ? Math.max(0, selectedCorrectActionCount - selectedIncorrectActionCount) / correctActionCount
      : 0;
  }

  private resolveScoreDelta(
    command: EvaluatePartyActionSubmissionCommand,
    stagePoints: number,
    correctness: boolean | number,
  ): number {
    const correctnessRatio = typeof correctness === 'boolean' ? Number(correctness) : correctness;

    if (correctnessRatio <= 0 || stagePoints <= 0) {
      return 0;
    }

    const totalDurationMs = (command.context?.lifecycle.stageTimeLimitSeconds ?? 0) * 1_000;
    const stageEndsAtEpochMs = command.context?.lifecycle.stageEndsAtEpochMs ?? null;

    if (totalDurationMs <= 0 || stageEndsAtEpochMs === null) {
      return Math.ceil(stagePoints * correctnessRatio);
    }

    const remainingDurationMs = stageEndsAtEpochMs - Date.now();

    if (remainingDurationMs <= 0) {
      throw new PartyCommandNotAvailableError({
        actionIds: command.actionIds,
        gameId: command.gameId,
        reason: 'stageExpired',
        remainingDurationMs,
        stageEndsAtEpochMs,
        stageId: command.context?.lifecycle.stageId,
      });
    }

    const boundedRemainingDurationMs = Math.min(totalDurationMs, remainingDurationMs);

    return Math.max(1, Math.ceil((stagePoints * correctnessRatio * boundedRemainingDurationMs) / totalDurationMs));
  }
}
