import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/identity/entities/user';
import type {
  AuthRepository,
  UpdateProfileInput,
} from '../../../domains/identity/ports/auth-repository';
import { AuthRepositoryToken } from '../../../domains/identity/ports/auth-repository';

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(input: UpdateProfileInput): Promise<User> {
    return this.authRepository.updateProfile(input);
  }
}
