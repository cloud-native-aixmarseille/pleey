import { IAuthRepository } from "../../domains/auth/ports/auth.repository.interface";
import { IStorage } from "../../shared/ports/storage.interface";
import { USER_STORAGE_KEY } from "../../shared/constants/storageKeys";
import type { User } from "../../shared/types";

/**
 * Fetches the authenticated user profile from the backend and
 * synchronizes it with the local storage cache.
 */
export class GetProfileUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly storage: IStorage,
  ) {}

  async execute(): Promise<User> {
    const user = await this.authRepository.getCurrentUser();
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}
