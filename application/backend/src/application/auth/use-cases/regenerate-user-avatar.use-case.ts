import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { UserAvatarService } from '../../../domain/auth/services/user-avatar.service';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-uri.util';

@Injectable()
export class RegenerateUserAvatarUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async execute(userId: UserId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    const avatarBuffer = this.userAvatarService.generateAvatar();
    const updated = await this.userRepository.updateProfile(userId, {
      avatarUri: avatarBuffer,
    });

    return mapUserToPublicProfile(updated);
  }
}
