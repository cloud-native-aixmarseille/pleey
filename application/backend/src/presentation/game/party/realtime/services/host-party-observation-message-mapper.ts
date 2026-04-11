import { Injectable } from '@nestjs/common';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import type {
  HostPartyObservationMessage,
  PartyObservationPlayerMessage,
} from './party-observation-message';

@Injectable()
export class HostPartyObservationMessageMapper {
  toMessage(
    observation: HostPartyObservation,
    gameType: GameType,
    livePlayerIdentities: readonly PartyPlayerIdentity[],
  ): HostPartyObservationMessage {
    return {
      partyId: observation.partyId,
      gameType,
      pin: observation.pin,
      status: observation.status,
      context: observation.context,
      isObserverHost: true,
      host: {
        avatarUri: observation.host.avatarUri,
        username: observation.host.username,
      },
      players: this.toPlayerMessages(observation.players, livePlayerIdentities, null),
    };
  }

  private toPlayerMessages(
    players: readonly PartyPlayer[],
    livePlayerIdentities: readonly PartyPlayerIdentity[],
    currentPlayerIdentity: PartyPlayerIdentity | null,
  ): readonly PartyObservationPlayerMessage[] {
    return players.map((player) => ({
      avatarUri: player.avatarUri,
      identity: player.identity,
      isCurrentPlayer:
        currentPlayerIdentity !== null &&
        this.areSamePlayerIdentity(player.identity, currentPlayerIdentity),
      isLive: livePlayerIdentities.some((identity) =>
        this.areSamePlayerIdentity(player.identity, identity),
      ),
      totalScore: player.totalScore,
      username: player.username,
    }));
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
