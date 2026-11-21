import { Inject, Injectable } from '@nestjs/common';
import {
  IDENTITY_ERROR_DEFINITIONS,
  IdentityErrorCode,
} from '../../../../domain/identity/enums/identity-error-code.enum';
import { PasswordTooShortError } from '../../../../domain/identity/errors/password-too-short.error';
import {
  type PasswordRecoveryPort,
  PasswordRecoveryPortProvider,
} from '../../../../domain/identity/ports/password-recovery.port';
import { type RecoveryToken, RecoveryTokenProvider } from '../../../../domain/identity/ports/recovery-token';
import { PasswordService } from '../../../../domain/identity/services/password-service';
import { createDomainError } from '../../../../domain/shared/errors/domain-error';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PasswordRecoveryPortProvider) private readonly recovery: PasswordRecoveryPort,
    @Inject(RecoveryTokenProvider) private readonly tokens: RecoveryToken,
    private readonly passwords: PasswordService,
  ) {}

  async execute(token: string, password: string): Promise<void> {
    if (!this.passwords.isValidPassword(password)) {
      throw new PasswordTooShortError({ reason: 'passwordPolicy' });
    }
    const passwordHash = await this.passwords.hash(password);
    const consumed =
      /^[a-f0-9]{64}$/.test(token) && (await this.recovery.consumeToken(this.tokens.digest(token), passwordHash));
    if (!consumed) {
      throw createDomainError(IDENTITY_ERROR_DEFINITIONS[IdentityErrorCode.INVALID_RESET_TOKEN], {
        reason: 'invalidOrExpiredResetToken',
      });
    }
  }
}
