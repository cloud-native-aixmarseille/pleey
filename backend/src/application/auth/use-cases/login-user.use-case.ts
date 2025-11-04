import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { PasswordService } from '../../../domain/auth/services/password.service';
import type { AuthResponseDto } from '../dto/auth-response.dto';
import type { LoginUserDto } from '../dto/login-user.dto';

/**
 * Login User Use Case
 * Handles user login and JWT token generation
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider) private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) { }

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        await this.i18n.translate('auth.errors.invalidCredentials')
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        await this.i18n.translate('auth.errors.invalidCredentials')
      );
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    const token = this.jwtService.sign(payload);

    // Return response
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }
}
