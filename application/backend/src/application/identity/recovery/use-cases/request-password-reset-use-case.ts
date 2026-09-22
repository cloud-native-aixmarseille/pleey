import { Inject, Injectable } from '@nestjs/common';
import {
  type PasswordRecoveryPort,
  PasswordRecoveryPortProvider,
} from '../../../../domain/identity/ports/password-recovery.port';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(@Inject(PasswordRecoveryPortProvider) private readonly recovery: PasswordRecoveryPort) {}

  async execute(email: string, locale: string): Promise<void> {
    // Never look up the account on the public request path.
    await this.recovery.enqueue(email.trim(), locale);
  }
}
