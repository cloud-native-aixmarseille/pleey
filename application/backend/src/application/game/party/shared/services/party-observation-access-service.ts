import { Inject, Injectable } from '@nestjs/common';
import type { PartyId, PartyPlayerIdentity } from '@pleey/contracts/party';
import { PartyPlayerKind } from '@pleey/contracts/party';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import {
  PartyPlayerSessionRegistry,
  PartyPlayerSessionRegistryProvider,
} from '../../../../../domain/game/party/player/services/party-player-session-registry';
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
      observation.players.find(
        ({ identity }) =>
          identity.kind === PartyPlayerKind.USER &&
          actor.userId !== undefined &&
          identity.userId === actor.userId &&
          participant.identity.kind === PartyPlayerKind.USER &&
          participant.identity.userId === identity.userId,
      )?.identity ?? null
    );
  }

  assertCanObserve(observation: HostPartyObservation, actor: PartyObservationActor): void {
    if (!this.canObserve(observation, actor)) throw new PartyNotFoundError({ partyId: observation.partyId });
  }
}
