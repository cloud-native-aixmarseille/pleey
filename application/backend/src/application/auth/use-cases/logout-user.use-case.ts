import { Inject, Injectable } from '@nestjs/common';
import type { UserRepository } from '../../../domain/auth/repositories/user.repository.interface';
import { UserRepositoryProvider } from '../../../domain/auth/repositories/user.repository.interface';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.userRepository.clearRefreshToken(userId);
  }
}
