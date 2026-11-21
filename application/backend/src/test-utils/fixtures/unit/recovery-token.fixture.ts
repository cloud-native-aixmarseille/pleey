import type { RecoveryToken } from '../../../domain/identity/ports/recovery-token';
import { CryptoRecoveryToken } from '../../../infrastructure/identity/services/crypto-recovery-token';

export const createRecoveryTokenAdapter = (): RecoveryToken => new CryptoRecoveryToken();
