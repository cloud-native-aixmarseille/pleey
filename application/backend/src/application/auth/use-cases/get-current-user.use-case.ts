import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-url.util';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    return mapUserToPublicProfile(user);
  }
}
