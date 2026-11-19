import type { GuestId } from '@pleey/domain/identity';
import { PartyPlayerKind } from '@pleey/domain/party';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { HostPartyControlDto } from './host-party-control.dto';

export type HostPartyPlayerIdentity =
  | {
      readonly kind: PartyPlayerKind.USER;
      readonly userId: UserId;
    }
  | {
      readonly kind: PartyPlayerKind.GUEST;
      readonly guestId: GuestId;
    };

export interface HostPartyPlayerControlDto extends HostPartyControlDto {
  readonly playerIdentity: HostPartyPlayerIdentity;
}
