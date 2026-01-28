import { inject, injectable } from 'inversify';
import type { User } from '../../../domains/auth/entities/user';
import type { AuthRepository } from '../../../domains/auth/ports/auth-repository';
import { AUTH_SERVICE_ID } from '../contracts/auth-service-id';

export interface RegisterUserCommand {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  execute(command: RegisterUserCommand): Promise<User> {
    return this.authRepository.register(command.username, command.email, command.password);
  }
}
