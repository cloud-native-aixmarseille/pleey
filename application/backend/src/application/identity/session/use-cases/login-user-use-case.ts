import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../../../domain/identity/errors';
import {
  type AuthTokenResponse,
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../../domain/identity/ports/auth-token.service';
import type { UserAuthenticationRepository } from '../../../../domain/identity/ports/user-authentication.repository';
import { UserAuthenticationRepositoryProvider } from '../../../../domain/identity/ports/user-authentication.repository';
import { PasswordService } from '../../../../domain/identity/services/password-service';
import type { SessionClientMetadata } from '../../../../domain/identity/types/user-session';
import type { LoginUserDto } from '../dto/login-user-dto';

/**
 * Login User Use Case
 * Handles user login and JWT token generation
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserAuthenticationRepositoryProvider)
    private readonly authenticationRepository: UserAuthenticationRepository,
    private readonly passwordService: PasswordService,
    @Inject(AuthTokenServiceProvider)
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(dto: LoginUserDto, client?: SessionClientMetadata): Promise<AuthTokenResponse> {
    // Find user by email
    const authentication = await this.authenticationRepository.findByEmail(dto.email);
    if (!authentication) {
      throw new InvalidCredentialsError({
        email: dto.email,
        reason: 'userNotFound',
      });
    }

    const { user } = authentication;

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, authentication.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError({
        email: dto.email,
        reason: 'passwordMismatch',
      });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      username: user.username,
    };
    const tokenPair = this.authTokenService.createTokenPair(payload);

    const saved = await this.authenticationRepository.saveSession(
      user.id,
      {
        sessionId: tokenPair.sessionId,
        refreshTokenHash: this.authTokenService.hashToken(tokenPair.refreshToken),
        refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt,
        ...(client ? { client } : {}),
      },
      { password: authentication.password },
    );
    if (!saved) {
      throw new InvalidCredentialsError({ userId: user.id, reason: 'credentialsChanged' });
    }

    return this.authTokenService.mapTokensToResponse(tokenPair, user.toProfileSnapshot());
  }
}
