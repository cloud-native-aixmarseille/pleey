import { Buffer } from 'node:buffer';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';

@Injectable()
export class GetUserAvatarUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId): Promise<Buffer> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    if (!user.avatarUri) {
      throw new NotFoundException(AuthErrorCode.AVATAR_NOT_FOUND);
    }

    return user.avatarUri;
  }
}
