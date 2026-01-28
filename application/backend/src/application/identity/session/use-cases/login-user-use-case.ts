import { Inject, Injectable } from '@nestjs/common';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import {
  type AuthTokenResponse,
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../../domain/auth/ports/auth-token.service';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
import { PasswordService } from '../../../../domain/auth/services/password-service';
import type { LoginUserDto } from '../dto/login-user-dto';

/**
 * Login User Use Case
 * Handles user login and JWT token generation
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    @Inject(AuthTokenServiceProvider)
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthTokenResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      username: user.username,
    };
    const tokenPair = this.authTokenService.createTokenPair(payload);

    const hashedRefreshToken = await this.passwordService.hash(tokenPair.refreshToken);
    await this.userRepository.updateRefreshToken(
      user.id,
      hashedRefreshToken,
      tokenPair.refreshTokenExpiresAt,
    );

    return this.authTokenService.mapTokensToResponse(tokenPair, user.toProfileSnapshot());
  }
}
