import { PartyStatus } from '../../domain/game/party/enums/party-status.enum';
import type { HostPartyObservation } from '../../domain/game/party/host/entities/host-party-observation';
import { DEFAULT_PARTY_SETTINGS } from '../../domain/game/party/shared/entities/party-settings';
import { backendTestIdentifiers } from '../branded-identifiers';

export class PartyObservationFixtureFactory {
  createHost(overrides: Partial<HostPartyObservation> = {}): HostPartyObservation {
    return {
      isPrivate: true,
      partyId: backendTestIdentifiers.party(1),
      gameId: backendTestIdentifiers.game(1),
      pin: backendTestIdentifiers.partyPin('123456'),
      status: PartyStatus.WAITING,
      settings: DEFAULT_PARTY_SETTINGS,
      host: { userId: backendTestIdentifiers.user(1), username: 'Host', avatarUri: null },
      players: [],
      context: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    };
  }
}
