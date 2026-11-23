import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import {
  type UserSessionManagementPort,
  UserSessionManagementPortProvider,
} from '../../../../domain/identity/ports/user-session-management.port';

@Injectable()
export class RevokeOtherSessionsUseCase {
  constructor(@Inject(UserSessionManagementPortProvider) private readonly sessions: UserSessionManagementPort) {}

  execute(userId: UserId, currentSessionId: string) {
    return this.sessions.revokeOthers(userId, currentSessionId);
  }
}
