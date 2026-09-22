import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../shared/value-objects/pagination-query';
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
