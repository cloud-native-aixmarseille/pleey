import { describe, expect, it, vi } from 'vitest';
import { ValkeyCaptchaFixture } from '../../../test-utils/fixtures/integration/valkey-captcha.fixture';

const valkeyUrl = process.env.CAPTCHA_TEST_VALKEY_URL;
const describeWithValkey = valkeyUrl ? describe : describe.skip;

describeWithValkey('ValkeyCaptchaStore', () => {
  it('atomically rejects duplicate nonces across independent connections and expires them', async () => {
    // Arrange
    const fixture = new ValkeyCaptchaFixture(valkeyUrl ?? '');
    // Act + Assert
    try {
      await fixture.start();
      const key = `${fixture.prefix}:nonce`;
      // Act
      const results = await Promise.all(
        Array.from({ length: 20 }, (_, index) => (index % 2 ? fixture.first : fixture.second).consumeNonce(key, 150)),
      );
      // Assert
      expect(results.filter(Boolean)).toHaveLength(1);
      await vi.waitFor(async () => expect(await fixture.second.consumeNonce(key, 1000)).toBe(true));
    } finally {
      fixture.stop();
    }
  });

  it('consumes a token once across replicas without burning a token sent to the wrong action', async () => {
    // Arrange
    const fixture = new ValkeyCaptchaFixture(valkeyUrl ?? '');
    // Act + Assert
    try {
      await fixture.start();
      const key = `${fixture.prefix}:token`;
      await fixture.first.saveToken(key, 'signup', 1000);
      // Act
      const wrongAction = await fixture.second.consumeToken(key, 'password-recovery');
      const results = await Promise.all(
        Array.from({ length: 20 }, (_, index) =>
          (index % 2 ? fixture.first : fixture.second).consumeToken(key, 'signup'),
        ),
      );
      // Assert
      expect(wrongAction).toBe(false);
      expect(results.filter(Boolean)).toHaveLength(1);
    } finally {
      fixture.stop();
    }
  });

  it('counts requests atomically across connections and resets counters after their window', async () => {
    // Arrange
    const fixture = new ValkeyCaptchaFixture(valkeyUrl ?? '');
    // Act + Assert
    try {
      await fixture.start();
      const key = `${fixture.prefix}:rate`;
      // Act
      const counts = await Promise.all(
        Array.from({ length: 20 }, (_, index) => (index % 2 ? fixture.first : fixture.second).increment(key, 150)),
      );
      // Assert
      expect(counts.sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
      await vi.waitFor(async () => expect(await fixture.second.increment(key, 1000)).toBe(1));
    } finally {
      fixture.stop();
    }
  });
});
