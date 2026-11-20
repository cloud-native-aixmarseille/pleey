import type { GuestId } from '@pleey/contracts/identity';
import type { PartyId } from '@pleey/contracts/party';

export interface PartyGuestCredentialSubject {
  readonly partyId: PartyId;
  readonly guestId: GuestId;
  readonly joinedAt: Date;
}

export abstract class PartyGuestCredentialPort {
  abstract issue(subject: PartyGuestCredentialSubject): string;
  abstract verify(credential: string, subject: PartyGuestCredentialSubject): boolean;
}
