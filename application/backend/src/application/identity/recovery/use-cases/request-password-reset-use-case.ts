import { Inject, Injectable } from '@nestjs/common';
import { CaptchaAction } from '../../../../domain/identity/enums/captcha-action.enum';
import {
  type PasswordRecoveryPort,
  PasswordRecoveryPortProvider,
} from '../../../../domain/identity/ports/password-recovery.port';
import { type CaptchaPort, CaptchaPortProvider } from '../../captcha/ports/captcha.port';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(PasswordRecoveryPortProvider) private readonly recovery: PasswordRecoveryPort,
    @Inject(CaptchaPortProvider) private readonly captcha: CaptchaPort,
  ) {}

  async execute(email: string, locale: string, captchaToken: string, peer: string): Promise<void> {
    await this.captcha.verify(CaptchaAction.PASSWORD_RECOVERY, captchaToken, peer);
    // Never look up the account on the public request path.
    await this.recovery.enqueue(email.trim(), locale);
  }
}
