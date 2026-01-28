import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/auth/ports/user.repository';
import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId): Promise<UserProfileSnapshot> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(AuthErrorCode.USER_NOT_FOUND);
    }

    return user.toProfileSnapshot();
  }
}
