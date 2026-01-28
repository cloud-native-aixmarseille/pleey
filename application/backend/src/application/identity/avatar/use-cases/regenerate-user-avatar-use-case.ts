import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
import { UserAvatarService } from '../../../../domain/auth/services/user-avatar-service';
import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';

@Injectable()
export class RegenerateUserAvatarUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async execute(userId: UserId): Promise<UserProfileSnapshot> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(AuthErrorCode.USER_NOT_FOUND);
    }

    const avatar = this.userAvatarService.generateAvatar();
    const updated = await this.userRepository.updateProfile(userId, {
      avatar,
    });

    return updated.toProfileSnapshot();
  }
}
