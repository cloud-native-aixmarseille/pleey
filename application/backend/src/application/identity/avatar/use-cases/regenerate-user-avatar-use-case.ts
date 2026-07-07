import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { UserNotFoundError } from '../../../../domain/identity/errors';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import { UserAvatarService } from '../../../../domain/identity/services/user-avatar-service';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';

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
      throw new UserNotFoundError({ userId });
    }

    const avatar = this.userAvatarService.generateAvatar();
    const updated = await this.userRepository.updateProfile(userId, {
      avatar,
    });

    return updated.toProfileSnapshot();
  }
}
