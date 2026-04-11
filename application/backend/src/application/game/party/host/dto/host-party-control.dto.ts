import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface HostPartyControlDto {
  readonly hostUserId: UserId;
  readonly partyId: PartyId;
}
