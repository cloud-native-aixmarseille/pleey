import { injectable } from 'inversify';
import type { PrivatePartyPasswordGeneratorPort } from '../../../domains/game/party/shared/ports/private-party-password-generator.port';

const PRIVATE_PARTY_PASSWORD_LENGTH = 12;
const PRIVATE_PARTY_PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*';

@injectable()
export class CryptoPrivatePartyPasswordGeneratorAdapter
  implements PrivatePartyPasswordGeneratorPort
{
  generatePrivatePartyPassword(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const randomValues = crypto.getRandomValues(new Uint32Array(PRIVATE_PARTY_PASSWORD_LENGTH));

      return Array.from(randomValues)
        .map(
          (value) =>
            PRIVATE_PARTY_PASSWORD_ALPHABET[
              value % PRIVATE_PARTY_PASSWORD_ALPHABET.length
            ] as string,
        )
        .join('');
    }

    return Array.from({ length: PRIVATE_PARTY_PASSWORD_LENGTH }, () => {
      const index = Math.floor(Math.random() * PRIVATE_PARTY_PASSWORD_ALPHABET.length);

      return PRIVATE_PARTY_PASSWORD_ALPHABET[index] as string;
    }).join('');
  }
}
