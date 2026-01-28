import type { AuthSession } from '../entities/auth-session';
import type { User } from '../entities/user';

export interface UpdateProfileInput {
  readonly username?: string;
  readonly email?: string;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(username: string, email: string, password: string): Promise<User>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  regenerateAvatar(): Promise<User>;
  logout(): Promise<void>;
}
