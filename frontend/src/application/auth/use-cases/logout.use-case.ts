import { IStorage } from '../../../shared/ports/storage.interface';

const TOKEN_STORAGE_KEY = 'quizmaster_token';
const USER_STORAGE_KEY = 'quizmaster_user';

/**
 * Logout Use Case
 * Handles user logout business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class LogoutUseCase {
  constructor(private readonly storage: IStorage) { }

  execute(): void {
    this.storage.removeItem(TOKEN_STORAGE_KEY);
    this.storage.removeItem(USER_STORAGE_KEY);
  }
}
