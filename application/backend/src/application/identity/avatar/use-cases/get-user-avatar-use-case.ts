import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
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
      throw new Error(IdentityErrorCode.USER_NOT_FOUND);
    }

    if (!user.avatar) {
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    return user.avatar;
  }
}
