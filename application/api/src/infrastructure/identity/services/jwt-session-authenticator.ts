import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { IDENTITY_ERROR_DEFINITIONS, IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import {
  type UserAuthenticationRepository,
  UserAuthenticationRepositoryProvider,
} from '../../../domain/identity/ports/user-authentication.repository';
import { createDomainError } from '../../../domain/shared/errors/domain-error';
import { AUTH_JWT_SECRET } from '../auth-jwt-secret.token';

@Injectable()
export class JwtSessionAuthenticator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userIdentifier: UserIdentifier,
    @Inject(UserAuthenticationRepositoryProvider) private readonly users: UserAuthenticationRepository,
    @Inject(AUTH_JWT_SECRET) private readonly secret: string,
  ) {}

  async authenticate(token: string, recordActivity = true) {
    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: this.secret, algorithms: ['HS256'] });
    } catch {
      throw createDomainError(IDENTITY_ERROR_DEFINITIONS[IdentityErrorCode.UNAUTHORIZED], {
        reason: 'invalidAccessToken',
      });
    }
    return this.validate(payload, recordActivity);
  }

  async validate(payload: unknown, recordActivity = true) {
    const claims = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
    const id = this.userIdentifier.parseOrNull(claims.id);
    if (
      !id ||
      claims.tokenType !== 'access' ||
      typeof claims.sessionId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(claims.sessionId) ||
      typeof claims.username !== 'string' ||
      typeof claims.exp !== 'number' ||
      claims.exp * 1000 <= Date.now() ||
      !(await this.users.isSessionActive(id, claims.sessionId, recordActivity))
    ) {
      throw createDomainError(IDENTITY_ERROR_DEFINITIONS[IdentityErrorCode.UNAUTHORIZED], {
        reason: 'inactiveAccessSession',
      });
    }
    return { id, username: claims.username, sessionId: claims.sessionId, exp: claims.exp };
  }
}
