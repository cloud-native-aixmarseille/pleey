import type { GuestId } from '../../../../identity/entities/guest';
import type { PartyId } from '../../shared/entities/party';

export interface PartyGuestCredentialSubject {
  readonly partyId: PartyId;
  readonly guestId: GuestId;
  readonly joinedAt: Date;
}

export abstract class PartyGuestCredentialPort {
  abstract issue(subject: PartyGuestCredentialSubject): string;
  abstract verify(credential: string, subject: PartyGuestCredentialSubject): boolean;
}
