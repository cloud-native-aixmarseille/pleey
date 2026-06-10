import { injectable } from 'inversify';
import { adjectives, nouns, uniqueUsernameGenerator } from 'unique-username-generator';
import type { GuestUsernameGeneratorPort } from '../../../../domains/game/party/player/ports/guest-username-generator.port';

@injectable()
export class UniqueUsernameGuestUsernameGeneratorAdapter implements GuestUsernameGeneratorPort {
  generateGuestUsername(): string {
    return uniqueUsernameGenerator({
      dictionaries: [adjectives, nouns],
      separator: ' ',
      style: 'capital',
      template: '{0} {1} {digits:4}',
    });
  }
}
