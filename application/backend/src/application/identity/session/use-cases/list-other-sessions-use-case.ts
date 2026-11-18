import { Inject, Injectable } from '@nestjs/common';
import type { PaginationQuery } from '@pleey/domain/shared/primitives';
import type { UserId } from '../../../../domain/identity/entities/user';
import {
  type UserSessionManagementPort,
  UserSessionManagementPortProvider,
} from '../../../../domain/identity/ports/user-session-management.port';

@Injectable()
export class ListOtherSessionsUseCase {
  constructor(@Inject(UserSessionManagementPortProvider) private readonly sessions: UserSessionManagementPort) {}

  execute(userId: UserId, currentSessionId: string, query: PaginationQuery) {
    return this.sessions.listOthers(userId, currentSessionId, query);
  }
}
