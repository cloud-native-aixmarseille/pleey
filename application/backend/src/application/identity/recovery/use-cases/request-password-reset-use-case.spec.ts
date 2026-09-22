import { describe, expect, it } from 'vitest';
import { PasswordRecoveryMockFactory } from '../../../../test-utils/mock-factories/password-recovery-mock-factory';
import { RequestPasswordResetUseCase } from './request-password-reset-use-case';

describe('RequestPasswordResetUseCase', () => {
  it.each(['alice@example.com', 'unknown@example.com'])(
    'queues the same work for %s without looking up the account',
    async (email) => {
      // Arrange
      const recovery = new PasswordRecoveryMockFactory().create();
      const useCase = new RequestPasswordResetUseCase(recovery);
      // Act
      const result = await useCase.execute(email, 'fr');
      // Assert
      expect(result).toBeUndefined();
      expect(recovery.enqueue).toHaveBeenCalledWith(email, 'fr');
      expect(recovery.issueToken).not.toHaveBeenCalled();
    },
  );
});
