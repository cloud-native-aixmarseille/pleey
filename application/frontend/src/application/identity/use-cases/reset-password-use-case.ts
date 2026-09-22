import { inject, injectable } from 'inversify';
import { type AuthRepository, AuthRepositoryToken } from '../../../domains/identity/ports/auth-repository';

@injectable()
export class ResetPasswordUseCase {
  constructor(@inject(AuthRepositoryToken) private readonly authRepository: AuthRepository) {}

  execute(token: string, password: string): Promise<void> {
    return this.authRepository.resetPassword(token, password);
  }
}
