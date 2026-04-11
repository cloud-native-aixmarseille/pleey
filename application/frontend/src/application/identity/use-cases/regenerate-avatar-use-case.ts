import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/identity/entities/user';
import {
  type AuthRepository,
  AuthRepositoryToken,
} from '../../../domains/identity/ports/auth-repository';

@injectable()
export class RegenerateAvatarUseCase {
  constructor(
    @inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(): Promise<User> {
    return this.authRepository.regenerateAvatar();
  }
}
