import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import {
  GameTypeLiveRegistryProvider,
  useGameTypeLiveRegistry,
} from './game-type-live-registry-context';

describe('game-type-live-registry-context', () => {
  it('returns the registry resolver provided through context', () => {
    const resolve = vi.fn().mockReturnValue({ key: 'quiz-live-facade' });
    const wrapper = ({ children }: PropsWithChildren) => (
      <GameTypeLiveRegistryProvider value={{ resolve }}>{children}</GameTypeLiveRegistryProvider>
    );

    const { result } = renderHook(() => useGameTypeLiveRegistry(), { wrapper });

    expect(result.current.resolve('quiz')).toEqual({ key: 'quiz-live-facade' });
    expect(resolve).toHaveBeenCalledWith('quiz');
  });

  it('throws when the hook is used without its provider', () => {
    expect(() => renderHook(() => useGameTypeLiveRegistry())).toThrow(
      PresentationContextErrorCode.GAME_PROVIDER_REQUIRED,
    );
  });
});
