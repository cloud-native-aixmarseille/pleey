import type { PartyId } from '@pleey/domain/party';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface HostPartyControlDto {
  readonly hostUserId: UserId;
  readonly partyId: PartyId;
}
