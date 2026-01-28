import { Inject, Injectable } from '@nestjs/common';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
import { PasswordService } from '../../../../domain/auth/services/password-service';
import { UserAvatarService } from '../../../../domain/auth/services/user-avatar-service';
import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';
import type { RegisterUserDto } from '../dto/register-user-dto';

/**
 * Register User Use Case
 * Handles user registration logic
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<UserProfileSnapshot> {
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new Error(AuthErrorCode.USER_ALREADY_EXISTS);
    }

    // Validate password strength
    if (!this.passwordService.isValidPassword(dto.password)) {
      throw new Error(AuthErrorCode.PASSWORD_TOO_SHORT);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Generate random avatar
    const avatar = this.userAvatarService.generateAvatar();

    // Create user
    const created = await this.userRepository.create(
      dto.username,
      dto.email,
      hashedPassword,
      avatar,
    );

    return created.toProfileSnapshot();
  }
}
