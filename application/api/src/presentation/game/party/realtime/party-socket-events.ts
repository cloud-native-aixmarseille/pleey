export {
  PARTY_SOCKET_INBOUND_EVENTS,
  PARTY_SOCKET_OUTBOUND_EVENTS,
  type PartyRuntimeNoticeKind,
} from '@pleey/contracts/party';

export function resolvePartyObservationRoom(partyId: string): string {
  return `party:${partyId}`;
}
