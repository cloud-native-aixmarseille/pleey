import { IAuthRepository } from "../../../domains/auth/ports/auth.repository.interface";
import { IStorage } from "../../../domains/shared/ports/storage.interface";
import { USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import type { User } from "../../../domains/auth/types";

/**
 * Regenerate Avatar Use Case
 * Requests a new avatar from the backend and updates local cache.
 */
export class RegenerateAvatarUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly storage: IStorage,
  ) { }

  async execute(): Promise<User> {
    const user = await this.authRepository.regenerateAvatar();
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

