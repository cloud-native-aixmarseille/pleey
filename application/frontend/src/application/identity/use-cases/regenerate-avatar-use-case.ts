import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/auth/entities/user';
import type { AuthRepository } from '../../../domains/auth/ports/auth-repository';
import { AUTH_SERVICE_ID } from '../contracts/auth-service-id';

@injectable()
export class RegenerateAvatarUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(): Promise<User> {
    return this.authRepository.regenerateAvatar();
  }
}
