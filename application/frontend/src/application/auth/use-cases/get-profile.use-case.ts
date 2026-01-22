import { AuthRepository } from "../../../domains/auth/ports/auth.repository";
import { Storage } from "../../../domains/shared/ports/storage";
import { USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import type { User } from "../../../domains/auth/types";

/**
 * Fetches the authenticated user profile from the backend and
 * synchronizes it with the local storage cache.
 */
export class GetProfileUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storage: Storage,
  ) { }

  async execute(): Promise<User> {
    const user = await this.authRepository.getCurrentUser();
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

