import { inject, injectable } from 'inversify';
import type { AuthRepository } from '../../../domains/auth/ports/auth-repository';
import { AUTH_SERVICE_ID } from '../contracts/auth-service-id';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
