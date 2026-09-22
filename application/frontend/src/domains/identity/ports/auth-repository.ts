import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../shared/value-objects/pagination-query';
import type { AuthSession } from '../entities/auth-session';
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
  requestPasswordReset(email: string, locale: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  gameHistory(query: PaginationQuery): Promise<UserGameHistoryPage>;
  sessions(query: PaginationQuery): Promise<UserSessionOverview>;
  revokeSession(sessionId: string): Promise<void>;
  revokeOtherSessions(): Promise<void>;
  login(email: string, password: string): Promise<AuthSession>;
  register(username: string, email: string, password: string): Promise<User>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  regenerateAvatar(): Promise<User>;
  logout(): Promise<void>;
}

export const AuthRepositoryToken = Symbol('AuthRepository');
