import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';
import type { UpdateProfileDto } from '../dto/update-profile-dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId, dto: UpdateProfileDto): Promise<UserProfileSnapshot> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(AuthErrorCode.USER_NOT_FOUND);
    }

    if (dto.email) {
      const existingByEmail = await this.userRepository.findByEmail(dto.email);
      if (existingByEmail && existingByEmail.id !== userId) {
        throw new Error(AuthErrorCode.USER_ALREADY_EXISTS);
      }
    }

    if (dto.username) {
      const existingByUsername = await this.userRepository.findByUsername(dto.username);
      if (existingByUsername && existingByUsername.id !== userId) {
        throw new Error(AuthErrorCode.USER_ALREADY_EXISTS);
      }
    }

    const updated = await this.userRepository.updateProfile(userId, {
      username: dto.username,
      email: dto.email,
    });

    return updated.toProfileSnapshot();
  }
}
