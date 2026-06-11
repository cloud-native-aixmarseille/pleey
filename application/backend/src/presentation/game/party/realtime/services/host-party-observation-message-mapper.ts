import { Injectable } from '@nestjs/common';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PlayerPartyObservationPlayer } from '../../../../../domain/game/party/player/entities/player-party-observation';
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
    playerObservationPlayers: readonly PlayerPartyObservationPlayer[] = [],
  ): HostPartyObservationMessage {
    const stagesStatsByIdentity = this.createStagesStatsMap(playerObservationPlayers);
    const livePlayerIdentityKeys = this.createIdentityKeySet(livePlayerIdentities);

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
      players: this.toPlayerMessages(
        observation.players,
        livePlayerIdentityKeys,
        stagesStatsByIdentity,
      ),
    };
  }

  private createStagesStatsMap(
    players: readonly PlayerPartyObservationPlayer[],
  ): ReadonlyMap<string, number> {
    return new Map(
      players.map((player) => [this.toPlayerIdentityKey(player.identity), player.correctStages]),
    );
  }

  private createIdentityKeySet(identities: readonly PartyPlayerIdentity[]): ReadonlySet<string> {
    return new Set(identities.map((identity) => this.toPlayerIdentityKey(identity)));
  }

  private toPlayerMessages(
    players: readonly PartyPlayer[],
    livePlayerIdentityKeys: ReadonlySet<string>,
    stagesStatsByIdentity: ReadonlyMap<string, number>,
  ): readonly PartyObservationPlayerMessage[] {
    return players.map((player) => {
      const playerIdentityKey = this.toPlayerIdentityKey(player.identity);

      return {
        avatarUri: player.avatarUri,
        correctStages: stagesStatsByIdentity.get(playerIdentityKey) ?? 0,
        identity: player.identity,
        isCurrentPlayer: false,
        isLive: livePlayerIdentityKeys.has(playerIdentityKey),
        totalScore: player.totalScore,
        username: player.username,
      };
    });
  }

  private toPlayerIdentityKey(identity: PartyPlayerIdentity): string {
    if (identity.kind === PartyPlayerKind.USER) {
      return `user:${identity.userId}`;
    }

    return `guest:${identity.guestId}`;
  }
}
