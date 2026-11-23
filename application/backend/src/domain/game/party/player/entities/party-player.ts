import type { ParticipantId } from '@pleey/contracts/identity';
import { PartyPlayerKind } from '@pleey/contracts/party';
import type { UserId } from '../../../../identity/entities/user';

interface BasePartyPlayer {
  readonly avatarUri: string | null;
  readonly joinedAt: Date;
  readonly totalScore: number;
  readonly username: string;
}

export type PartyPlayer =
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerKind.USER;
        readonly userId: UserId;
      };
    })
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerKind.PARTICIPANT;
        readonly participantId: ParticipantId;
      };
    });
