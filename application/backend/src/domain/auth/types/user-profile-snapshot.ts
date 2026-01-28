import type { UserId } from '../entities/user';

export interface UserProfileSnapshot {
  id: UserId;
  username: string;
  email: string;
  createdAt: Date;
  avatarVersion: string | null;
}
