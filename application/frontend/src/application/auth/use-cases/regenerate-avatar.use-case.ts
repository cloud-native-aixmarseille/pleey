import { AuthRepository } from "../../../domains/auth/ports/auth.repository";
import { Storage } from "../../../domains/shared/ports/storage";
import { USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import type { User } from "../../../domains/auth/types";

/**
 * Regenerate Avatar Use Case
 * Requests a new avatar from the backend and updates local cache.
 */
export class RegenerateAvatarUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storage: Storage,
  ) { }

  async execute(): Promise<User> {
    const user = await this.authRepository.regenerateAvatar();
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

