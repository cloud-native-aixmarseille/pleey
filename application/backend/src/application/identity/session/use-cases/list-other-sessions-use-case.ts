import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import {
  type UserSessionManagementPort,
  UserSessionManagementPortProvider,
} from '../../../../domain/identity/ports/user-session-management.port';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';

@Injectable()
export class ListOtherSessionsUseCase {
  constructor(@Inject(UserSessionManagementPortProvider) private readonly sessions: UserSessionManagementPort) {}

  execute(userId: UserId, currentSessionId: string, query: PaginationQuery) {
    return this.sessions.listOthers(userId, currentSessionId, query);
  }
}
