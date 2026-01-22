import type { User } from "../../../domains/auth/types";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import { Storage } from "../../../domains/shared/ports/storage";

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
  constructor(private readonly storage: Storage) { }

  execute(): RestoreSessionResponse | null {
    const storedToken = this.storage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = this.storage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser) as User;
      return {
        token: storedToken,
        user,
      };
    } catch {
      // Invalid JSON, clear storage
      this.storage.removeItem(TOKEN_STORAGE_KEY);
      this.storage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}

