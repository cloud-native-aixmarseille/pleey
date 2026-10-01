import { Injectable } from '@nestjs/common';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import type { PlayerPartyObservationMessage } from './party-observation-message';

@Injectable()
export class PlayerPartyObservationMessageMapper {
  toMessage(
    observation: PlayerPartyObservation,
    gameType: GameType,
    livePlayerIdentities: readonly PartyPlayerIdentity[],
    currentPlayerIdentity: PartyPlayerIdentity | null,
  ): PlayerPartyObservationMessage {
    return {
      partyId: observation.partyId,
      gameType,
      pin: observation.pin,
      status: observation.status,
      settings: observation.settings,
      context: this.toContext(observation, currentPlayerIdentity),
      isObserverHost: false,
      host: observation.host,
      players: observation.players.map((player) => ({
        avatarUri: player.avatarUri,
        correctStages: player.correctStages,
        identity: player.identity,
        isCurrentPlayer:
          currentPlayerIdentity !== null && this.areSamePlayerIdentity(currentPlayerIdentity, player.identity),
        isLive: livePlayerIdentities.some((identity) => this.areSamePlayerIdentity(identity, player.identity)),
        totalScore: player.totalScore,
        username: player.username,
      })),
    };
  }

  private toContext(
    observation: PlayerPartyObservation,
    currentPlayerIdentity: PartyPlayerIdentity | null,
  ): PartyRuntimeContext | null {
    if (!observation.context || currentPlayerIdentity === null) {
      return observation.context;
    }

    const currentPlayerActionState = observation.playerActionStates.find((entry) => {
      return (
        entry.state.stageId === observation.context?.lifecycle.stageId &&
        this.areSamePlayerIdentity(entry.identity, currentPlayerIdentity)
      );
    });

    if (!currentPlayerActionState) {
      return observation.context;
    }

    if (observation.context.lifecycle.phase === 'stage') {
      return observation.context.stage?.actionSubmission
        ? {
            ...observation.context,
            stage: {
              ...observation.context.stage,
              actionSubmission: {
                ...observation.context.stage.actionSubmission,
                currentPlayer: {
                  selectedActionId: currentPlayerActionState.state.selectedActionId,
                  selectedActionIds: currentPlayerActionState.state.selectedActionIds ?? [
                    currentPlayerActionState.state.selectedActionId,
                  ],
                  status: currentPlayerActionState.state.status,
                },
              },
            },
          }
        : observation.context;
    }

    if (observation.context.lifecycle.phase !== 'result' && observation.context.lifecycle.phase !== 'ended') {
      return observation.context;
    }

    const selectedActionIds = currentPlayerActionState.state.selectedActionIds ?? [
      currentPlayerActionState.state.selectedActionId,
    ];
    const selectedResultActions =
      observation.context.result?.current?.actions.filter((action) => selectedActionIds.includes(action.id)) ?? [];
    const correctActionCount =
      observation.context.result?.current?.actions.filter((action) => action.isCorrect).length ?? 0;
    const isCorrect =
      selectedResultActions.length === correctActionCount && selectedResultActions.every((action) => action.isCorrect);

    return observation.context.result
      ? {
          ...observation.context,
          result: {
            ...observation.context.result,
            currentPlayer:
              selectedResultActions.length > 0
                ? {
                    earnedPoints: currentPlayerActionState.state.earnedPoints,
                    isCorrect,
                    selectedActionId: currentPlayerActionState.state.selectedActionId,
                    selectedActionIds,
                  }
                : null,
          },
        }
      : observation.context;
  }

  private areSamePlayerIdentity(left: PartyPlayerIdentity, right: PartyPlayerIdentity): boolean {
    if (left.kind === PartyPlayerKind.USER && right.kind === PartyPlayerKind.USER) {
      return left.userId === right.userId;
    }

    if (left.kind === PartyPlayerKind.GUEST && right.kind === PartyPlayerKind.GUEST) {
      return left.guestId === right.guestId;
    }

    return false;
  }
}
