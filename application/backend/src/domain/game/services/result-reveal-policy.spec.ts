import { describe, expect, it } from 'vitest';
import { ResultRevealPolicy } from './result-reveal-policy';

describe('ResultRevealPolicy', () => {
  it('returns 0 when timeSeconds is 0 or negative', () => {
    const policy = new ResultRevealPolicy();
    expect(policy.getRevealDelayMs(0)).toBe(0);
    expect(policy.getRevealDelayMs(-1)).toBe(0);
  });

  it('converts seconds to milliseconds (floored)', () => {
    const policy = new ResultRevealPolicy();
    expect(policy.getRevealDelayMs(10)).toBe(10000);
    expect(policy.getRevealDelayMs(1.234)).toBe(1234);
  });

  it('throws when timeSeconds is not finite', () => {
    const policy = new ResultRevealPolicy();
    expect(() => policy.getRevealDelayMs(Number.NaN)).toThrow();
    expect(() => policy.getRevealDelayMs(Number.POSITIVE_INFINITY)).toThrow();
  });
});
