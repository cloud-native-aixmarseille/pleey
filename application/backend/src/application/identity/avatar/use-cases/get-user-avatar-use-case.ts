import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { AvatarNotFoundError, UserNotFoundError } from '../../../../domain/identity/errors';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import type { Media } from '../../../../domain/media/entities/media';

@Injectable()
export class GetUserAvatarUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId): Promise<Media> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError({ userId });
    }

    if (!user.avatar) {
      throw new AvatarNotFoundError({ userId });
    }

    return user.avatar;
  }
}
