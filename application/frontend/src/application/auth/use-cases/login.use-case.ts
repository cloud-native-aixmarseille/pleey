import { AuthRepository } from "../../../domains/auth/ports/auth.repository";
import type { User } from "../../../domains/auth/types";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import { Storage } from "../../../domains/shared/ports/storage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Login Use Case
 * Handles user authentication business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storage: Storage,
  ) { }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;

    // Authenticate with repository
    const { token, user } = await this.authRepository.login(email, password);

    // Persist credentials
    this.storage.setItem(TOKEN_STORAGE_KEY, token);
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { token, user };
  }
}

