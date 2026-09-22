import { describe, expect, it, vi } from 'vitest';
import { createRecoveryTokenAdapter } from '../../../../test-utils/fixtures/unit/recovery-token.fixture';
import { PasswordRecoveryMockFactory } from '../../../../test-utils/mock-factories/password-recovery-mock-factory';
import { DeliverPasswordResetUseCase } from './deliver-password-reset-use-case';

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

describe('DeliverPasswordResetUseCase', () => {
  it('stores only a digest and sends the raw token through the private mail boundary', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const request = { email: 'alice@example.com', locale: 'fr', requestedAt: new Date() };
    recovery.claim.mockResolvedValue(request);
    const mailer = { send: vi.fn().mockResolvedValue(undefined) };
    const tokens = createRecoveryTokenAdapter();
    const useCase = new DeliverPasswordResetUseCase(recovery, mailer, tokens, THIRTY_MINUTES_IN_MS);
    const before = Date.now();
    // Act
    await useCase.execute();
    // Assert
    const token = mailer.send.mock.calls[0][1] as string;
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(recovery.issueToken).toHaveBeenCalledWith(request.email, tokens.digest(token), expect.any(Date));
    expect(recovery.issueToken.mock.calls[0][2].getTime()).toBeGreaterThanOrEqual(before + THIRTY_MINUTES_IN_MS);
    expect(recovery.complete).toHaveBeenCalledWith(request);
  });

  it('uses the injected token lifetime when issuing reset links', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const request = { email: 'alice@example.com', locale: 'fr', requestedAt: new Date() };
    recovery.claim.mockResolvedValue(request);
    const mailer = { send: vi.fn().mockResolvedValue(undefined) };
    const tokens = createRecoveryTokenAdapter();
    const customLifetimeMs = 45 * 60 * 1000;
    const useCase = new DeliverPasswordResetUseCase(recovery, mailer, tokens, customLifetimeMs);
    const before = Date.now();

    // Act
    await useCase.execute();

    // Assert
    expect(recovery.issueToken.mock.calls[0][2].getTime()).toBeGreaterThanOrEqual(before + customLifetimeMs);
  });

  it('completes unknown-account requests without sending mail', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    const request = { email: 'unknown@example.com', locale: 'en', requestedAt: new Date() };
    recovery.claim.mockResolvedValue(request);
    recovery.issueToken.mockResolvedValue(false);
    const mailer = { send: vi.fn() };
    const useCase = new DeliverPasswordResetUseCase(
      recovery,
      mailer,
      createRecoveryTokenAdapter(),
      THIRTY_MINUTES_IN_MS,
    );
    // Act
    await useCase.execute();
    // Assert
    expect(mailer.send).not.toHaveBeenCalled();
    expect(recovery.complete).toHaveBeenCalledWith(request);
  });

  it('leaves failed deliveries available for retry after their claim lease expires', async () => {
    // Arrange
    const recovery = new PasswordRecoveryMockFactory().create();
    recovery.claim.mockResolvedValue({ email: 'alice@example.com', locale: 'en', requestedAt: new Date() });
    const mailer = { send: vi.fn().mockRejectedValue(new Error('SMTP unavailable')) };
    const useCase = new DeliverPasswordResetUseCase(
      recovery,
      mailer,
      createRecoveryTokenAdapter(),
      THIRTY_MINUTES_IN_MS,
    );
    // Act + Assert
    await expect(useCase.execute()).rejects.toThrow('SMTP unavailable');
    expect(recovery.complete).not.toHaveBeenCalled();
  });
});
