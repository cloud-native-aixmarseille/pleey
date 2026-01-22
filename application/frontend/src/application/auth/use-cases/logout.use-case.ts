import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import { Storage } from "../../../domains/shared/ports/storage";

/**
 * Logout Use Case
 * Handles user logout business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class LogoutUseCase {
  constructor(private readonly storage: Storage) { }

  execute(): void {
    this.storage.removeItem(TOKEN_STORAGE_KEY);
    this.storage.removeItem(USER_STORAGE_KEY);
  }
}
