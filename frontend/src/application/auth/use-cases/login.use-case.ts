import { IAuthRepository } from '../../domains/auth/ports/auth.repository.interface';
import { IStorage } from '../../shared/ports/storage.interface';
import { User } from '../../shared/types';

const TOKEN_STORAGE_KEY = 'quizmaster_token';
const USER_STORAGE_KEY = 'quizmaster_user';

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
    private readonly authRepository: IAuthRepository,
    private readonly storage: IStorage
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
