import { ConflictException, Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { User } from '../../../domain/auth/entities/user.entity';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { PasswordService } from '../../../domain/auth/services/password.service';
import type { RegisterUserDto } from '../dto/register-user.dto';
import { I18nService } from 'nestjs-i18n';

/**
 * Register User Use Case
 * Handles user registration logic
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider) private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly i18n: I18nService,
  ) { }

  async execute(dto: RegisterUserDto): Promise<User> {
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new ConflictException(
        await this.i18n.translate('auth.errors.userWithEmailOrUsernameExists')
      );
    }

    // Validate password strength
    if (!this.passwordService.isValidPassword(dto.password)) {
      throw new BadRequestException(
        await this.i18n.translate('auth.errors.passwordTooShort')
      );
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create user
    return this.userRepository.create(
      dto.username,
      dto.email,
      hashedPassword,
      false, // Not admin by default
    );
  }
}
