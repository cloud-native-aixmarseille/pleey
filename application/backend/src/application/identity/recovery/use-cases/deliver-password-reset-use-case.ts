import { Inject, Injectable } from '@nestjs/common';
import {
  type PasswordRecoveryPort,
  PasswordRecoveryPortProvider,
} from '../../../../domain/identity/ports/password-recovery.port';
import {
  type PasswordResetMailer,
  PasswordResetMailerProvider,
} from '../../../../domain/identity/ports/password-reset-mailer';
import { type RecoveryToken, RecoveryTokenProvider } from '../../../../domain/identity/ports/recovery-token';
import { PASSWORD_RESET_TOKEN_LIFETIME_MS } from './password-reset-token-lifetime-ms.token';

@Injectable()
export class DeliverPasswordResetUseCase {
  constructor(
    @Inject(PasswordRecoveryPortProvider) private readonly recovery: PasswordRecoveryPort,
    @Inject(PasswordResetMailerProvider) private readonly mailer: PasswordResetMailer,
    @Inject(RecoveryTokenProvider) private readonly tokens: RecoveryToken,
    @Inject(PASSWORD_RESET_TOKEN_LIFETIME_MS) private readonly resetTokenLifetimeMs: number,
  ) {}

  async execute(): Promise<boolean> {
    const request = await this.recovery.claim();
    if (!request) return false;

    const token = this.tokens.generate();
    const issued = await this.recovery.issueToken(
      request.email,
      this.tokens.digest(token),
      new Date(Date.now() + this.resetTokenLifetimeMs),
    );
    if (issued) await this.mailer.send(request.email, token, request.locale);
    await this.recovery.complete(request);
    return true;
  }
}
