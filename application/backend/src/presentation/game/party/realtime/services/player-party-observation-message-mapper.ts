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
      context: this.toContext(observation, currentPlayerIdentity),
      isObserverHost: false,
      host: observation.host,
      players: observation.players.map((player) => ({
        avatarUri: player.avatarUri,
        identity: player.identity,
        isCurrentPlayer:
          currentPlayerIdentity !== null &&
          this.areSamePlayerIdentity(currentPlayerIdentity, player.identity),
        isLive: livePlayerIdentities.some((identity) =>
          this.areSamePlayerIdentity(identity, player.identity),
        ),
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

    const currentPlayerResultAction = observation.context.result?.current?.actions.find(
      (action) => action.id === currentPlayerActionState.state.selectedActionId,
    );

    return {
      ...observation.context,
      result: observation.context.result
        ? {
            ...observation.context.result,
            currentPlayer: currentPlayerResultAction
              ? {
                  earnedPoints: currentPlayerResultAction.earnedPoints,
                  isCorrect: currentPlayerResultAction.isCorrect,
                  selectedActionId: currentPlayerActionState.state.selectedActionId,
                }
              : null,
          }
        : observation.context.result,
      stage: observation.context.stage?.actionSubmission
        ? {
            ...observation.context.stage,
            actionSubmission: {
              ...observation.context.stage.actionSubmission,
              currentPlayer: {
                selectedActionId: currentPlayerActionState.state.selectedActionId,
                status: currentPlayerActionState.state.status,
              },
            },
          }
        : observation.context.stage,
    };
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
