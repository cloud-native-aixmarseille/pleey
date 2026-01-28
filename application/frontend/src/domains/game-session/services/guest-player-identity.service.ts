import type { GuestPlayerIdentity } from '../entities/guest-player-identity';
import type { GuestPlayerIdGeneratorPort } from '../ports/guest-player-id-generator.port';

export class GuestPlayerIdentityService {
  constructor(private readonly guestPlayerIdGenerator: GuestPlayerIdGeneratorPort) {}

  resolveIdentity(
    nickname: string,
    restoredIdentity: GuestPlayerIdentity | null,
  ): GuestPlayerIdentity {
    return {
      id: restoredIdentity?.id ?? this.guestPlayerIdGenerator.generate(),
      nickname: nickname.trim(),
    } satisfies GuestPlayerIdentity;
  }
}
