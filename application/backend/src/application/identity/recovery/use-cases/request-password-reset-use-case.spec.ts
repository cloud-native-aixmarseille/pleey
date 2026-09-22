import { describe, expect, it } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { CaptchaInvalidError } from '../../../../domain/identity/errors/captcha-invalid.error';
import { CaptchaMockFactory } from '../../../../test-utils/mock-factories/captcha-mock-factory';
import { PasswordRecoveryMockFactory } from '../../../../test-utils/mock-factories/password-recovery-mock-factory';
import { RequestPasswordResetUseCase } from './request-password-reset-use-case';

describe('RequestPasswordResetUseCase', () => {
  it('rejects an invalid CAPTCHA before scheduling recovery', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const captcha = new CaptchaMockFactory().create();
    captcha.verify.mockRejectedValue(new CaptchaInvalidError({ action: 'password-recovery' }));
    const useCase = new RequestPasswordResetUseCase(recovery, captcha);
    // Act + Assert
    await expect(useCase.execute('alice@example.com', 'fr', 'forged', '127.0.0.1')).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_INVALID,
    );
    expect(recovery.enqueue).not.toHaveBeenCalled();
  });

  it.each(['alice@example.com', 'unknown@example.com'])(
    'queues the same work for %s without looking up the account',
    async (email) => {
      // Arrange
      const recovery = new PasswordRecoveryMockFactory().create();
      const useCase = new RequestPasswordResetUseCase(recovery, new CaptchaMockFactory().create());
      // Act
      const result = await useCase.execute(email, 'fr', 'verified', '127.0.0.1');
      // Assert
      expect(result).toBeUndefined();
      expect(recovery.enqueue).toHaveBeenCalledWith(email, 'fr');
      expect(recovery.issueToken).not.toHaveBeenCalled();
    },
  );
});
