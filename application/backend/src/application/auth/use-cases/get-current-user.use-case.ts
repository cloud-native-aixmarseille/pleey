import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-uri.util';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: UserId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    return mapUserToPublicProfile(user);
  }
}
