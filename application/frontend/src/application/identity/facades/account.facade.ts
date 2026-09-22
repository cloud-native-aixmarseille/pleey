import { inject, injectable } from 'inversify';
import { type AuthRepository, AuthRepositoryToken } from '../../../domains/identity/ports/auth-repository';
import type { PaginationQuery } from '../../../domains/shared/value-objects/pagination-query';
import type { AccountGateway } from '../ports/account.gateway';

@injectable()
export class AccountFacade implements AccountGateway {
  constructor(@inject(AuthRepositoryToken) private readonly repository: AuthRepository) {}

  gameHistory(query: PaginationQuery) {
    return this.repository.gameHistory(query);
  }

  sessions(query: PaginationQuery) {
    return this.repository.sessions(query);
  }

  revokeSession(sessionId: string): Promise<void> {
    return this.repository.revokeSession(sessionId);
  }

  revokeOtherSessions(): Promise<void> {
    return this.repository.revokeOtherSessions();
  }
}
