import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RecoveryToken } from '../../../domain/identity/ports/recovery-token';

@Injectable()
export class CryptoRecoveryToken implements RecoveryToken {
  generate(): string {
    return randomBytes(32).toString('hex');
  }

  digest(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
