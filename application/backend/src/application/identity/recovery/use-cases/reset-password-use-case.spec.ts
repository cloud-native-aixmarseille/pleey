import { describe, expect, it } from 'vitest';
import { PasswordService } from '../../../../domain/identity/services/password-service';
import { createRecoveryTokenAdapter } from '../../../../test-utils/fixtures/unit/recovery-token.fixture';
import { PasswordRecoveryMockFactory } from '../../../../test-utils/mock-factories/password-recovery-mock-factory';
import { ResetPasswordUseCase } from './reset-password-use-case';

describe('ResetPasswordUseCase', () => {
  it('hashes the replacement password and consumes the token digest', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const tokens = createRecoveryTokenAdapter();
    const token = tokens.generate();
    const passwords = new PasswordService();
    const useCase = new ResetPasswordUseCase(recovery, tokens, passwords);
    // Act
    await useCase.execute(token, 'new-password');
    const hash = recovery.consumeToken.mock.calls[0][1];
    const matches = await passwords.compare('new-password', hash);
    // Assert
    expect(recovery.consumeToken.mock.calls[0][0]).toBe(tokens.digest(token));
    expect(hash).not.toBe('new-password');
    expect(matches).toBe(true);
  });

  it.each(['invalid', 'a'.repeat(64)])('uses the same safe error for rejected token %s', async (token) => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    recovery.consumeToken.mockResolvedValue(false);
    const useCase = new ResetPasswordUseCase(recovery, createRecoveryTokenAdapter(), new PasswordService());
    // Act + Assert
    await expect(useCase.execute(token, 'new-password')).rejects.toThrow('INVALID_RESET_TOKEN');
  });

  it.each(['short', 'é'.repeat(37)])('rejects passwords outside the bcrypt-safe policy', async (password) => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const useCase = new ResetPasswordUseCase(recovery, createRecoveryTokenAdapter(), new PasswordService());
    // Act + Assert
    await expect(useCase.execute('a'.repeat(64), password)).rejects.toThrow('PASSWORD_TOO_SHORT');
    expect(recovery.consumeToken).not.toHaveBeenCalled();
  });
});
