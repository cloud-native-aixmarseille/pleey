import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId): Promise<UserProfileSnapshot> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(IdentityErrorCode.USER_NOT_FOUND);
    }

    return user.toProfileSnapshot();
  }
}
