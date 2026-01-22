import { AuthRepository } from "../../../domains/auth/ports/auth.repository";

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
  constructor(private readonly authRepository: AuthRepository) { }

  async execute(request: RegisterRequest): Promise<void> {
    const { username, email, password } = request;
    await this.authRepository.register(username, email, password);
  }
}
