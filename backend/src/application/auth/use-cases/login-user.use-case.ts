import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/auth/services/password.service';
import type { AuthResponseDto } from '../dto/auth-response.dto';
import type { LoginUserDto } from '../dto/login-user.dto';

/**
 * Login User Use Case
 * Handles user login and JWT token generation
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
