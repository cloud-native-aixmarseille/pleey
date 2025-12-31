import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import type { User } from '../../../domain/auth/entities/user.entity';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import { PasswordService } from '../../../domain/auth/services/password.service';
import { UserAvatarService } from '../../../domain/auth/services/user-avatar.service';
import type { RegisterUserDto } from '../dto/register-user.dto';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

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

  async execute(dto: RegisterUserDto): Promise<User> {
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new ConflictException(AuthErrorCode.USER_ALREADY_EXISTS);
    }

    // Validate password strength
    if (!this.passwordService.isValidPassword(dto.password)) {
      throw new BadRequestException(AuthErrorCode.PASSWORD_TOO_SHORT);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Generate deterministic avatar seed from registration data
    const avatarUrl = this.userAvatarService.generateAvatar(`${dto.username}-${dto.email}`);

    // Create user
    return this.userRepository.create(
      dto.username,
      dto.email,
      hashedPassword,
      false, // Not admin by default
      avatarUrl,
    );
  }
}
