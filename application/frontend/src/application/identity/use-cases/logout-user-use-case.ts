import { inject, injectable } from 'inversify';
import {
  type AuthRepository,
  AuthRepositoryToken,
} from '../../../domains/identity/ports/auth-repository';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
