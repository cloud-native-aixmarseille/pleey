import { Injectable } from '@nestjs/common';
import type { PartyStageCatalogEntry } from '../../../../../application/game/types/shared/ports/party-stage-catalog.port';
import type { PartyPlayerActionState } from '../../player/entities/party-player-action-state';
import type { PartyActionId } from '../entities/party-action';
import { type PartyRuntimeContext, PartyRuntimePhase } from '../entities/party-runtime-context';

interface ProjectPartyRuntimeContextInput {
  readonly baseContext: PartyRuntimeContext | null;
  readonly currentPlayerActionState?: PartyPlayerActionState | null;
  readonly playerActionStates: readonly PartyPlayerActionState[];
  readonly stage: PartyStageCatalogEntry | null;
  readonly submittedPlayerCount: number;
  readonly totalEligiblePlayerCount: number;
}

@Injectable()
export class PartyRuntimeContextProjectionService {
  project(input: ProjectPartyRuntimeContextInput): PartyRuntimeContext | null {
    if (!input.baseContext) {
      return null;
    }

    const stageId = input.baseContext.lifecycle.stageId;

    if (
      input.baseContext.lifecycle.phase !== PartyRuntimePhase.STAGE ||
      stageId === null ||
      !input.stage ||
      input.stage.id !== stageId
    ) {
      return this.projectResultContext(input.baseContext, input, stageId);
    }

    const currentPlayerActionState =
      input.currentPlayerActionState?.stageId === stageId ? input.currentPlayerActionState : null;

    return {
      lifecycle: input.baseContext.lifecycle,
      stage: {
        actionSubmission: {
          currentPlayer: currentPlayerActionState
            ? {
                selectedActionId: currentPlayerActionState.selectedActionId,
                status: currentPlayerActionState.status,
              }
            : null,
          submittedPlayerCount: input.submittedPlayerCount,
          totalEligiblePlayerCount: input.totalEligiblePlayerCount,
        },
        current: {
          actions: input.stage.actions.map((action) => ({
            id: action.id,
            text: action.text,
          })),
          text: input.stage.text,
        },
      },
    };
  }

  private projectResultContext(
    baseContext: PartyRuntimeContext,
    input: ProjectPartyRuntimeContextInput,
    stageId: PartyRuntimeContext['lifecycle']['stageId'],
  ): PartyRuntimeContext {
    const stage = input.stage;

    if (
      baseContext.lifecycle.phase !== PartyRuntimePhase.RESULT ||
      stageId === null ||
      !stage ||
      stage.id !== stageId
    ) {
      return baseContext;
    }

    const actionCounts = new Map<PartyActionId, number>();

    for (const playerActionState of input.playerActionStates) {
      if (playerActionState.stageId !== stageId) {
        continue;
      }

      actionCounts.set(
        playerActionState.selectedActionId,
        (actionCounts.get(playerActionState.selectedActionId) ?? 0) + 1,
      );
    }

    const totalVotes = Array.from(actionCounts.values()).reduce((sum, value) => sum + value, 0);
    const currentPlayerAction =
      input.currentPlayerActionState?.stageId === stageId ? input.currentPlayerActionState : null;
    const selectedAction = currentPlayerAction
      ? (stage.actions.find((action) => action.id === currentPlayerAction.selectedActionId) ?? null)
      : null;

    return {
      lifecycle: baseContext.lifecycle,
      result: {
        current: {
          actions: stage.actions.map((action) => {
            const actionCount = actionCounts.get(action.id) ?? 0;

            return {
              actionCount,
              actionPercent: totalVotes > 0 ? Math.round((actionCount / totalVotes) * 100) : 0,
              earnedPoints: action.isCorrect ? stage.points : 0,
              id: action.id,
              isCorrect: action.isCorrect,
              text: action.text,
            };
          }),
          text: stage.text,
        },
        currentPlayer:
          currentPlayerAction === null || selectedAction === null
            ? null
            : {
                earnedPoints: currentPlayerAction.earnedPoints,
                isCorrect: selectedAction.isCorrect,
                selectedActionId: currentPlayerAction.selectedActionId,
              },
      },
    };
  }
}
