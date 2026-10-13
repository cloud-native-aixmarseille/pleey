import { Inject, Injectable } from '@nestjs/common';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import {
  PartyPlayerSessionRegistry,
  PartyPlayerSessionRegistryProvider,
} from '../../../../../domain/game/party/player/services/party-player-session-registry';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { PartyObservationPolicy } from '../../../../../domain/game/party/shared/services/party-observation-policy';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface PartyObservationActor {
  readonly userId?: UserId;
  readonly participant?: {
    readonly partyId: PartyId;
    readonly identity: PartyPlayerIdentity;
    readonly sessionId: string;
  };
}

@Injectable()
export class PartyObservationAccessService {
  constructor(
    @Inject(PartyPlayerSessionRegistryProvider) private readonly sessions: PartyPlayerSessionRegistry,
    @Inject(PartyObservationPolicy) private readonly policy: PartyObservationPolicy,
  ) {}

  canObserve(observation: HostPartyObservation, actor: PartyObservationActor): boolean {
    const isVerifiedParticipant =
      observation.players.some(
        ({ identity }) =>
          identity.kind === PartyPlayerKind.USER && actor.userId !== undefined && identity.userId === actor.userId,
      ) || this.verifiedPlayerIdentity(observation, actor) !== null;
    return this.policy.decide({
      isPrivate: observation.isPrivate,
      isHost: actor.userId !== undefined && actor.userId === observation.host.userId,
      isVerifiedParticipant,
    }).allowed;
  }

  verifiedPlayerIdentity(observation: HostPartyObservation, actor: PartyObservationActor): PartyPlayerIdentity | null {
    const participant = actor.participant;
    if (
      participant?.partyId !== observation.partyId ||
      !this.sessions.isCurrentSession(observation.partyId, participant.identity, participant.sessionId)
    )
      return null;
    return (
      observation.players.find(({ identity }) => {
        if (identity.kind === PartyPlayerKind.USER)
          return (
            actor.userId !== undefined &&
            identity.userId === actor.userId &&
            participant.identity.kind === PartyPlayerKind.USER &&
            participant.identity.userId === identity.userId
          );
        return participant.identity.kind === PartyPlayerKind.GUEST && participant.identity.guestId === identity.guestId;
      })?.identity ?? null
    );
  }

  assertCanObserve(observation: HostPartyObservation, actor: PartyObservationActor): void {
    if (!this.canObserve(observation, actor)) throw new PartyNotFoundError({ partyId: observation.partyId });
  }
}
