import { describe, expect, it, vi } from 'vitest';
import { CaptchaAction } from '../../../domain/identity/enums/captcha-action.enum';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { CaptchaFixture } from '../../../test-utils/fixtures/unit/captcha.fixture';

describe('CapCaptchaAdapter', () => {
  it('issues short-lived signed puzzles without browser instrumentation', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const before = Date.now();
    // Act
    const challenge = await fixture.adapter.challenge(CaptchaAction.SIGNUP, fixture.peer);
    // Assert
    expect(challenge).toEqual({
      challenge: { c: 50, s: 32, d: 4 },
      token: expect.any(String),
      expires: expect.any(Number),
    });
    expect(challenge.expires - before).toBeGreaterThanOrEqual(120_000);
    expect(challenge.expires - Date.now()).toBeLessThanOrEqual(120_000);
  });

  it('accepts a real proof and consumes its verification token exactly once', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof();
    // Act
    const redemption = await fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer);
    await fixture.adapter.verify(CaptchaAction.SIGNUP, redemption.token, fixture.peer);
    // Assert
    await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, redemption.token, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_INVALID,
    );
    expect(redemption).toEqual({ success: true, token: expect.any(String), expires: expect.any(Number) });
  });

  it('stores only hashed token keys and keyed hashes of client addresses', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    // Act
    const redemption = await fixture.adapter.redeem(CaptchaAction.SIGNUP, await fixture.proof(), fixture.peer);
    // Assert
    const stored = JSON.stringify([...fixture.store.entries]);
    expect(stored).not.toContain(redemption.token);
    expect(stored).not.toContain(fixture.peer);
    expect([...fixture.store.entries.keys()].find((key) => key.startsWith('captcha:token:'))).toMatch(
      /^captcha:token:[a-f0-9]{64}$/,
    );
  });

  it('rejects forged signatures even when the proof was solved', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof(CaptchaAction.SIGNUP, 120_000, 'another_secret_at_least_32_bytes_long');
    // Act + Assert
    await expect(fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_INVALID,
    );
  });

  it('rejects invalid solutions without burning a valid challenge', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof();
    // Act + Assert
    await expect(
      fixture.adapter.redeem(CaptchaAction.SIGNUP, { ...proof, solutions: [] }, fixture.peer),
    ).rejects.toThrow(IdentityErrorCode.CAPTCHA_INVALID);
    await expect(fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer)).resolves.toMatchObject({
      success: true,
    });
  });

  it('rejects expired challenges', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof(CaptchaAction.SIGNUP, -1000);
    // Act + Assert
    await expect(fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_INVALID,
    );
  });

  it('rejects expired verification tokens', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const redemption = await fixture.adapter.redeem(CaptchaAction.SIGNUP, await fixture.proof(), fixture.peer);
    const clock = vi.spyOn(Date, 'now').mockReturnValue(redemption.expires + 1);
    // Act + Assert
    try {
      // Act + Assert
      await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, redemption.token, fixture.peer)).rejects.toThrow(
        IdentityErrorCode.CAPTCHA_INVALID,
      );
    } finally {
      clock.mockRestore();
    }
  });

  it('binds both proof and redemption token to the original operation', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof();
    // Act + Assert
    await expect(fixture.adapter.redeem(CaptchaAction.PASSWORD_RECOVERY, proof, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_INVALID,
    );
    const redemption = await fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer);
    await expect(
      fixture.adapter.verify(CaptchaAction.PASSWORD_RECOVERY, redemption.token, fixture.peer),
    ).rejects.toThrow(IdentityErrorCode.CAPTCHA_INVALID);
    await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, redemption.token, fixture.peer)).resolves.toBeUndefined();
  });

  it('allows only one of concurrent challenge redemptions and one concurrent token consumption', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof();
    // Act
    const redemptions = await Promise.allSettled(
      Array.from({ length: 5 }, () => fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer)),
    );
    const accepted = redemptions.find((result) => result.status === 'fulfilled');
    if (accepted?.status !== 'fulfilled') throw new Error('Expected one redeemed token');
    const verifications = await Promise.allSettled(
      Array.from({ length: 5 }, () => fixture.adapter.verify(CaptchaAction.SIGNUP, accepted.value.token, fixture.peer)),
    );
    // Assert
    expect(redemptions.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(verifications.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  });

  it.each(['', 'forged', `${'a'.repeat(16)}:${'b'.repeat(30)}`])(
    'rejects missing or unknown token %s',
    async (token) => {
      // Arrange
      const fixture = new CaptchaFixture();
      // Act + Assert
      await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, token, fixture.peer)).rejects.toThrow(
        IdentityErrorCode.CAPTCHA_INVALID,
      );
    },
  );

  it('limits repeated submissions including invalid tokens', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    // Act
    for (let index = 0; index < 10; index++)
      await fixture.adapter.verify(CaptchaAction.SIGNUP, 'forged', fixture.peer).catch(() => undefined);
    // Assert
    await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, 'forged', fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_RATE_LIMITED,
    );
    await expect(fixture.adapter.challenge(CaptchaAction.PASSWORD_RECOVERY, fixture.peer)).resolves.toBeDefined();
  });

  it('fails closed when shared storage is unavailable', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    vi.spyOn(fixture.store, 'increment').mockRejectedValue(new Error('connection lost'));
    // Act + Assert
    await expect(fixture.adapter.challenge(CaptchaAction.SIGNUP, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_UNAVAILABLE,
    );
    await expect(fixture.adapter.verify(CaptchaAction.SIGNUP, 'forged', fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_UNAVAILABLE,
    );
  });

  it('fails closed when nonce persistence fails after a valid proof', async () => {
    // Arrange
    const fixture = new CaptchaFixture();
    const proof = await fixture.proof();
    vi.spyOn(fixture.store, 'consumeNonce').mockRejectedValue(new Error('connection lost'));
    // Act + Assert
    await expect(fixture.adapter.redeem(CaptchaAction.SIGNUP, proof, fixture.peer)).rejects.toThrow(
      IdentityErrorCode.CAPTCHA_UNAVAILABLE,
    );
  });
});
