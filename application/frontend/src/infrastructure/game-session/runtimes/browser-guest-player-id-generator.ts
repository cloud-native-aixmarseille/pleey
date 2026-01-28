import { injectable } from 'inversify';
import type { GuestPlayerIdGeneratorPort } from '../../../domains/game-session/ports/guest-player-id-generator.port';

@injectable()
export class BrowserGuestPlayerIdGenerator implements GuestPlayerIdGeneratorPort {
  generate(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `guest-${Date.now().toString(36)}`;
  }
}
