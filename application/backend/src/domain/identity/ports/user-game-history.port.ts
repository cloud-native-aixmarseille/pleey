import type { PaginatedResult } from '@pleey/domain/shared/primitives';
import type { PaginationQuery } from '@pleey/domain/shared/primitives';
import type { UserId } from '../entities/user';

interface UserGameHistoryEntry {
  partyId: string;
  title: string;
  gameType: string;
  status: string;
  createdAt: Date;
  role: 'host' | 'player';
  points: number | null;
}

export type UserGameHistoryPage = PaginatedResult<UserGameHistoryEntry>;

export const UserGameHistoryPortProvider = Symbol('UserGameHistoryPort');

export interface UserGameHistoryPort {
  list(userId: UserId, query: PaginationQuery): Promise<UserGameHistoryPage>;
}
