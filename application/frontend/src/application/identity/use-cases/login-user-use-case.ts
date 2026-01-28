import { inject, injectable } from 'inversify';
import type { AuthSession } from '../../../domains/auth/entities/auth-session';
import type { AuthRepository } from '../../../domains/auth/ports/auth-repository';
import { AUTH_SERVICE_ID } from '../contracts/auth-service-id';

export interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(command: LoginUserCommand): Promise<AuthSession> {
    return this.authRepository.login(command.email, command.password);
  }
}
