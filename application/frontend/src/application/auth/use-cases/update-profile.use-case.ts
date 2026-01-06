import { IAuthRepository } from "../../domains/auth/ports/auth.repository.interface";
import { IStorage } from "../../application/shared/ports/storage.interface";
import { USER_STORAGE_KEY } from "../../application/shared/constants/storageKeys";
import type { User } from "../../domains/auth/types";

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
    private readonly authRepository: IAuthRepository,
    private readonly storage: IStorage,
  ) { }

  async execute(updates: UpdateProfileRequest): Promise<User> {
    const user = await this.authRepository.updateProfile(updates);
    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

