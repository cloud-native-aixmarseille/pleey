import { PartyPlayerKind } from '@pleey/contracts/party';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { HostPartyControlDto } from './host-party-control.dto';

export type HostPartyPlayerIdentity = {
  readonly kind: PartyPlayerKind.USER;
  readonly userId: UserId;
};

export interface HostPartyPlayerControlDto extends HostPartyControlDto {
  readonly playerIdentity: HostPartyPlayerIdentity;
}
