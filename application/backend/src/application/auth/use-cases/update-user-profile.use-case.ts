import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-uri.util';
import type { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    if (dto.email) {
      const existingByEmail = await this.userRepository.findByEmail(dto.email);
      if (existingByEmail && existingByEmail.id !== userId) {
        throw new ConflictException(AuthErrorCode.USER_ALREADY_EXISTS);
      }
    }

    if (dto.username) {
      const existingByUsername = await this.userRepository.findByUsername(dto.username);
      if (existingByUsername && existingByUsername.id !== userId) {
        throw new ConflictException(AuthErrorCode.USER_ALREADY_EXISTS);
      }
    }

    const updated = await this.userRepository.updateProfile(userId, {
      username: dto.username,
      email: dto.email,
    });

    return mapUserToPublicProfile(updated);
  }
}
