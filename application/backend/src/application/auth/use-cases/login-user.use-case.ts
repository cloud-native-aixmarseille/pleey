import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/auth/services/password.service';
import type { AuthResponseDto } from '../dto/auth-response.dto';
import type { LoginUserDto } from '../dto/login-user.dto';
import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { mapUserToPublicProfile, toPublicAvatarUrl } from '../../shared/utils/avatar-url.util';
import type { AuthTokenService } from '../services/auth-token.service';

/**
 * Login User Use Case
 * Handles user login and JWT token generation
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider) private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly authTokenService: AuthTokenService,
  ) { }

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
    const avatarUrl = toPublicAvatarUrl(user);
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      avatarUrl,
    };
    const tokenPair = this.authTokenService.createTokenPair(payload);

    const hashedRefreshToken = await this.passwordService.hash(tokenPair.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken, tokenPair.refreshTokenExpiresAt);

    return this.authTokenService.mapTokensToResponse(
      tokenPair,
      mapUserToPublicProfile(user),
    );
  }
}
