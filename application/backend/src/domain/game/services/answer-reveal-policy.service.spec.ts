import { describe, expect, it } from 'vitest';
import { AnswerRevealPolicy } from './answer-reveal-policy.service';

describe('AnswerRevealPolicy', () => {
  it('returns 0 when timeSeconds is 0 or negative', () => {
    const policy = new AnswerRevealPolicy();
    expect(policy.getRevealDelayMs(0)).toBe(0);
    expect(policy.getRevealDelayMs(-1)).toBe(0);
  });

  it('converts seconds to milliseconds (floored)', () => {
    const policy = new AnswerRevealPolicy();
    expect(policy.getRevealDelayMs(10)).toBe(10000);
    expect(policy.getRevealDelayMs(1.234)).toBe(1234);
  });

  it('throws when timeSeconds is not finite', () => {
    const policy = new AnswerRevealPolicy();
    expect(() => policy.getRevealDelayMs(Number.NaN)).toThrow();
    expect(() => policy.getRevealDelayMs(Number.POSITIVE_INFINITY)).toThrow();
  });
});
