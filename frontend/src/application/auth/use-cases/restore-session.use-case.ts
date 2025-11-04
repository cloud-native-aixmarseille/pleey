import { IStorage } from '../../shared/ports/storage.interface';
import { User } from '../../shared/types';

const TOKEN_STORAGE_KEY = 'quizmaster_token';
const USER_STORAGE_KEY = 'quizmaster_user';

export interface RestoreSessionResponse {
  token: string;
  user: User;
}

/**
 * Restore Session Use Case
 * Handles session restoration from storage
 * Following Clean Architecture and Single Responsibility Principle
 */
export class RestoreSessionUseCase {
  constructor(private readonly storage: IStorage) { }

  execute(): RestoreSessionResponse | null {
    const token = this.storage.getItem(TOKEN_STORAGE_KEY);
    const userJson = this.storage.getItem(USER_STORAGE_KEY);

    if (!token || !userJson) {
      return null;
    }

    try {
      const user: User = JSON.parse(userJson);
      return { token, user };
    } catch (error) {
      // Invalid JSON, clear storage
      this.storage.removeItem(TOKEN_STORAGE_KEY);
      this.storage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
