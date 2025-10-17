import { ConflictException, Injectable } from '@nestjs/common';
import type { User } from '../../../domain/auth/entities/user.entity';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/auth/services/password.service';
import type { RegisterUserDto } from '../dto/register-user.dto';

/**
 * Register User Use Case
 * Handles user registration logic
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Validate password strength
    if (!this.passwordService.isValidPassword(dto.password)) {
      throw new Error('Password must be at least 6 characters');
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
