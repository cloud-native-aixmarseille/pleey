import type { AuthRepository } from '../../../domains/identity/ports/auth-repository';

export type AccountGateway = Pick<AuthRepository, 'gameHistory' | 'sessions' | 'revokeSession' | 'revokeOtherSessions'>;

export const AccountGatewayToken = Symbol('AccountGateway');
