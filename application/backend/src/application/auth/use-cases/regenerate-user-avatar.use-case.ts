import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import { UserAvatarService } from '../../../domain/auth/services/user-avatar.service';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-url.util';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

@Injectable()
export class RegenerateUserAvatarUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async execute(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    const avatarUrl = this.userAvatarService.generateRandomAvatar();
    const updated = await this.userRepository.updateProfile(userId, {
      avatarUrl,
    });

    return mapUserToPublicProfile(updated);
  }
}
