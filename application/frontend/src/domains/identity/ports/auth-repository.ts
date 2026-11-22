import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { User } from '../entities/user';
import type { UserSessionOverview } from '../entities/user-session-details';

export interface UpdateProfileInput {
  readonly username?: string;
  readonly email?: string;
}

export type UserGameHistoryPage = PaginatedResult<{
  readonly partyId: string;
  readonly title: string;
  readonly gameType: string;
  readonly status: string;
  readonly createdAt: string;
  readonly role: string;
  readonly points: number | null;
}>;

export interface AuthRepository {
  currentUser(): Promise<User>;
  gameHistory(query: PaginationQuery): Promise<UserGameHistoryPage>;
  sessions(query: PaginationQuery): Promise<UserSessionOverview>;
  revokeSession(sessionId: string): Promise<void>;
  revokeOtherSessions(): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  regenerateAvatar(): Promise<User>;
}

export const AuthRepositoryToken = Symbol('AuthRepository');
