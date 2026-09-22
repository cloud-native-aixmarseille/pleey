import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCaptcha } from './use-captcha';

describe('useCaptcha', () => {
  it('consumes a token only once even before React rerenders', () => {
    // Arrange
    const { result } = renderHook(() => useCaptcha());
    act(() => result.current.updateToken('single-use-token'));
    const consumed: (string | null)[] = [];
    // Act
    act(() => {
      consumed.push(result.current.consumeToken());
      consumed.push(result.current.consumeToken());
    });
    // Assert
    expect(consumed).toEqual(['single-use-token', null]);
    expect(result.current.isVerified).toBe(false);
  });

  it('invalidates an expired or reset token', () => {
    // Arrange
    const { result } = renderHook(() => useCaptcha());
    act(() => result.current.updateToken('expired-token'));
    // Act
    act(() => result.current.updateToken(null));
    // Assert
    expect(result.current.isVerified).toBe(false);
  });

  it('clears a verification failure after a successful retry', () => {
    // Arrange
    const { result } = renderHook(() => useCaptcha());
    act(() => result.current.reportError());
    // Act
    act(() => result.current.updateToken('new-token'));
    // Assert
    expect(result.current.hasError).toBe(false);
    expect(result.current.isVerified).toBe(true);
  });
});
