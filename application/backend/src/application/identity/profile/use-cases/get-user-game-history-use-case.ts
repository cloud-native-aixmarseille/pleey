import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import {
  type UserGameHistoryPort,
  UserGameHistoryPortProvider,
} from '../../../../domain/identity/ports/user-game-history.port';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';

@Injectable()
export class GetUserGameHistoryUseCase {
  constructor(@Inject(UserGameHistoryPortProvider) private readonly history: UserGameHistoryPort) {}

  execute(userId: UserId, query: PaginationQuery) {
    return this.history.list(userId, query);
  }
}
