import { createHmac } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  PartyGuestCredentialPort,
  type PartyGuestCredentialSubject,
} from '../../../domain/game/party/player/ports/party-guest-credential.port';
import { AUTH_JWT_SECRET } from '../../identity/auth-jwt-secret.token';

const AUDIENCE = 'pleey:party-guest';

@Injectable()
export class JwtPartyGuestCredential implements PartyGuestCredentialPort {
  private readonly signingKey: string;

  constructor(
    private readonly jwt: JwtService,
    @Inject(AUTH_JWT_SECRET) secret: string,
  ) {
    this.signingKey = createHmac('sha256', secret).update(AUDIENCE).digest('hex');
  }

  issue(subject: PartyGuestCredentialSubject): string {
    return this.jwt.sign(
      {
        partyId: subject.partyId,
        guestId: subject.guestId,
        joinedAt: subject.joinedAt.toISOString(),
      },
      { secret: this.signingKey, algorithm: 'HS256', audience: AUDIENCE, expiresIn: '24h' },
    );
  }

  verify(credential: string, subject: PartyGuestCredentialSubject): boolean {
    try {
      const payload = this.jwt.verify<{ partyId?: unknown; guestId?: unknown; joinedAt?: unknown }>(credential, {
        secret: this.signingKey,
        algorithms: ['HS256'],
        audience: AUDIENCE,
      });
      return (
        payload.partyId === subject.partyId &&
        payload.guestId === subject.guestId &&
        payload.joinedAt === subject.joinedAt.toISOString()
      );
    } catch {
      return false;
    }
  }
}
