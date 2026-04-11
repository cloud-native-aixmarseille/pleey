import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';
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
      throw new Error(IdentityErrorCode.USER_NOT_FOUND);
    }

    if (dto.email) {
      const existingByEmail = await this.userRepository.findByEmail(dto.email);
      if (existingByEmail && existingByEmail.id !== userId) {
        throw new Error(IdentityErrorCode.USER_ALREADY_EXISTS);
      }
    }

    if (dto.username) {
      const existingByUsername = await this.userRepository.findByUsername(dto.username);
      if (existingByUsername && existingByUsername.id !== userId) {
        throw new Error(IdentityErrorCode.USER_ALREADY_EXISTS);
      }
    }

    const updated = await this.userRepository.updateProfile(userId, {
      username: dto.username,
      email: dto.email,
    });

    return updated.toProfileSnapshot();
  }
}
