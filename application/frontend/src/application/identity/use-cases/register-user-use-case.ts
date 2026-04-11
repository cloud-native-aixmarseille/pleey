import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/identity/entities/user';
import {
  type AuthRepository,
  AuthRepositoryToken,
} from '../../../domains/identity/ports/auth-repository';

export interface RegisterUserCommand {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(command: RegisterUserCommand): Promise<User> {
    return this.authRepository.register(command.username, command.email, command.password);
  }
}
