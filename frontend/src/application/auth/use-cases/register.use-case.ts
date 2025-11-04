import { IAuthRepository } from '../../domains/auth/ports/auth.repository.interface';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Register Use Case
 * Handles user registration business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) { }

  async execute(request: RegisterRequest): Promise<void> {
    const { username, email, password } = request;
    await this.authRepository.register(username, email, password);
  }
}
