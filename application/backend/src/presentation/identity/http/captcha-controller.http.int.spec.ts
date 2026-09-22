import { describe, expect, it, vi } from 'vitest';
import { CaptchaAction } from '../../../domain/identity/enums/captcha-action.enum';
import { CaptchaHttpFixture } from '../../../test-utils/fixtures/integration/captcha-http.fixture';

describe('CaptchaController', () => {
  it('serves the widget challenge and redemption wire protocol without exposing stored token keys', async () => {
    // Arrange
    const fixture = new CaptchaHttpFixture();
    // Act + Assert
    try {
      await fixture.start();
      const proof = await fixture.proof();
      // Act
      const challenge = await fixture.post('signup/challenge').send({});
      const redeemed = await fixture.post('signup/redeem').send(proof);
      // Assert
      expect(challenge.status).toBe(200);
      expect(challenge.headers['cache-control']).toBe('no-store');
      expect(challenge.body.challenge).toEqual({ c: 50, s: 32, d: 4 });
      expect(redeemed.status).toBe(200);
      expect(redeemed.body).toEqual({ success: true, token: expect.any(String), expires: expect.any(Number) });
    } finally {
      await fixture.stop();
    }
  });

  it.each([
    { token: 'signed', solutions: Array.from({ length: 51 }, () => 0) },
    { token: 'signed', solutions: [1.5] },
    { token: 'signed', solutions: [-1] },
    { token: 'signed', solutions: ['0'] },
    { token: 'signed', solutions: [Number.MAX_SAFE_INTEGER + 1] },
    { token: 'signed', solutions: [1], instr: { p: { ua: 'browser' } } },
    { token: 'x'.repeat(2049), solutions: [0] },
  ])('rejects malformed or instrumentation-bearing proofs at the transport boundary %#', async (body) => {
    // Arrange
    const fixture = new CaptchaHttpFixture();
    const redeem = vi.spyOn(fixture.adapter, 'redeem');
    // Act + Assert
    try {
      await fixture.start();
      // Act
      const response = await fixture.post('signup/redeem').send(body);
      // Assert
      expect(response.status).toBe(400);
      expect(redeem).not.toHaveBeenCalled();
    } finally {
      await fixture.stop();
    }
  });

  it('rejects unknown operations', async () => {
    // Arrange
    const fixture = new CaptchaHttpFixture();
    // Act + Assert
    try {
      await fixture.start();
      // Act
      const response = await fixture.post('arbitrary/challenge').send({});
      // Assert
      expect(response.status).toBe(400);
    } finally {
      await fixture.stop();
    }
  });

  it('does not trust forwarded client addresses by default', async () => {
    // Arrange
    const fixture = new CaptchaHttpFixture();
    const challenge = vi.spyOn(fixture.adapter, 'challenge');
    // Act + Assert
    try {
      await fixture.start();
      // Act
      await fixture.post('signup/challenge').set('X-Forwarded-For', '198.51.100.1').send({});
      // Assert
      expect(challenge).toHaveBeenCalledWith(CaptchaAction.SIGNUP, expect.stringContaining('127.0.0.1'));
    } finally {
      await fixture.stop();
    }
  });

  it('uses the closest untrusted address when the immediate proxy is explicitly trusted', async () => {
    // Arrange
    const fixture = new CaptchaHttpFixture();
    const challenge = vi.spyOn(fixture.adapter, 'challenge');
    // Act + Assert
    try {
      await fixture.start(['127.0.0.1', '::1']);
      // Act
      await fixture.post('password-recovery/challenge').set('X-Forwarded-For', '198.51.100.99, 192.0.2.5').send({});
      // Assert
      expect(challenge).toHaveBeenCalledWith(CaptchaAction.PASSWORD_RECOVERY, '192.0.2.5');
    } finally {
      await fixture.stop();
    }
  });
});
