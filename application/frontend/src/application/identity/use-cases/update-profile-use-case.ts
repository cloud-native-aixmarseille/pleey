import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/auth/entities/user';
import type {
  AuthRepository,
  UpdateProfileInput,
} from '../../../domains/auth/ports/auth-repository';
import { AUTH_SERVICE_ID } from '../contracts/auth-service-id';

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(input: UpdateProfileInput): Promise<User> {
    return this.authRepository.updateProfile(input);
  }
}
