import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider) private readonly userRepository: UserRepository,
  ) { }

  async execute(userId: number): Promise<void> {
    await this.userRepository.clearRefreshToken(userId);
  }
}
