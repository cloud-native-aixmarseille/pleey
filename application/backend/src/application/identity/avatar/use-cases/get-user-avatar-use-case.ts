import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
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
      throw new Error(AuthErrorCode.USER_NOT_FOUND);
    }

    if (!user.avatar) {
      throw new Error(AuthErrorCode.AVATAR_NOT_FOUND);
    }

    return user.avatar;
  }
}
