import { inject, injectable } from 'inversify';
import type { AuthSession } from '../../../domains/identity/entities/auth-session';
import {
  type AuthRepository,
  AuthRepositoryToken,
} from '../../../domains/identity/ports/auth-repository';

export interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(command: LoginUserCommand): Promise<AuthSession> {
    return this.authRepository.login(command.email, command.password);
  }
}
