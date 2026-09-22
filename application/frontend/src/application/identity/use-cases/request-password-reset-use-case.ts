import { inject, injectable } from 'inversify';
import { type AuthRepository, AuthRepositoryToken } from '../../../domains/identity/ports/auth-repository';

@injectable()
export class RequestPasswordResetUseCase {
  constructor(@inject(AuthRepositoryToken) private readonly authRepository: AuthRepository) {}

  execute(email: string, locale: string): Promise<void> {
    return this.authRepository.requestPasswordReset(email, locale);
  }
}
