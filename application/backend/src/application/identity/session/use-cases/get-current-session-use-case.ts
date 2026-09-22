import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { UnauthorizedError } from '../../../../domain/identity/errors';
import {
  type UserSessionManagementPort,
  UserSessionManagementPortProvider,
} from '../../../../domain/identity/ports/user-session-management.port';

@Injectable()
export class GetCurrentSessionUseCase {
  constructor(@Inject(UserSessionManagementPortProvider) private readonly sessions: UserSessionManagementPort) {}

  async execute(userId: UserId, sessionId: string) {
    const session = await this.sessions.current(userId, sessionId);
    if (!session) throw new UnauthorizedError({ userId, reason: 'inactiveCurrentSession' });
    return session;
  }
}
