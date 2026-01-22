import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import {
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../domain/auth/ports/auth-token.service';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { PasswordService } from '../../../domain/auth/services/password.service';
import { mapUserToPublicProfile, toPublicAvatarUri } from '../../shared/utils/avatar-uri.util';
import type { AuthResponseDto } from '../dto/auth-response.dto';
import type { LoginUserDto } from '../dto/login-user.dto';

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

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      avatarUri: toPublicAvatarUri(user),
    };
    const tokenPair = this.authTokenService.createTokenPair(payload);

    const hashedRefreshToken = await this.passwordService.hash(tokenPair.refreshToken);
    await this.userRepository.updateRefreshToken(
      user.id,
      hashedRefreshToken,
      tokenPair.refreshTokenExpiresAt,
    );

    return this.authTokenService.mapTokensToResponse(tokenPair, mapUserToPublicProfile(user));
  }
}
