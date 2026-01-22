import { AuthRepository } from "../../../domains/auth/ports/auth.repository";
import { Storage } from "../../../domains/shared/ports/storage";
import { USER_STORAGE_KEY } from "../../../domains/shared/constants/storageKeys";
import type { User } from "../../../domains/auth/types";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

/**
 * Update Profile Use Case
 * Updates authenticated user profile and syncs local cache.
 */
export class UpdateProfileUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storage: Storage,
  ) { }

  async execute(updates: UpdateProfileRequest): Promise<User> {
    const user = await this.authRepository.updateProfile(updates);
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

