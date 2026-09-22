import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { UserAuthenticationRepository } from '../../../../domain/identity/ports/user-authentication.repository';
import { UserAuthenticationRepositoryProvider } from '../../../../domain/identity/ports/user-authentication.repository';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(UserAuthenticationRepositoryProvider)
    private readonly authenticationRepository: UserAuthenticationRepository,
  ) {}

  async execute(userId: UserId, sessionId: string): Promise<void> {
    await this.authenticationRepository.clearSession(userId, sessionId);
  }
}
