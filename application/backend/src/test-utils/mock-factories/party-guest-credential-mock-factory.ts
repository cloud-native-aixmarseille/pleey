import { vi } from 'vitest';
import type { PartyGuestCredentialPort } from '../../domain/game/party/player/ports/party-guest-credential.port';

export class PartyGuestCredentialMockFactory {
  create() {
    return {
      issue: vi.fn<PartyGuestCredentialPort['issue']>().mockReturnValue('issued-test-credential'),
      verify: vi
        .fn<PartyGuestCredentialPort['verify']>()
        .mockImplementation((credential) => credential === 'verified-test-credential'),
    };
  }
}
