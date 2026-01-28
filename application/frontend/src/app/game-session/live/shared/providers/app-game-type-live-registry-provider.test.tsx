import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameTypeRegistryErrorCode } from '../../../../../domains/game-catalog/errors/game-type-registry-error-code';

const mocks = vi.hoisted(() => ({
  runtimeGetAll: vi.fn(),
}));

vi.mock('../../../../composition/runtime-container', () => ({
  runtimeContainer: {
    getAll: (...args: unknown[]) => mocks.runtimeGetAll(...args),
  },
}));

describe('AppGameTypeLiveRegistryProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('resolves uppercase runtime game type keys to registered live facades', async () => {
    // Arrange
    const facade = {
      gameTypeKey: 'quiz',
      titleKey: 'quiz.gameType.title',
      renderHostStageView: vi.fn(),
      renderPlayerStageView: vi.fn(),
      renderHostResultView: vi.fn(),
      renderPlayerResultView: vi.fn(),
    };
    mocks.runtimeGetAll.mockReturnValue([facade]);

    const [{ AppGameTypeLiveRegistryProvider }, { useGameTypeLiveRegistry }] = await Promise.all([
      import('./app-game-type-live-registry-provider'),
      import(
        '../../../../../presentation/game-session/live/shared/contexts/game-type-live-registry-context'
      ),
    ]);

    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGameTypeLiveRegistryProvider>{children}</AppGameTypeLiveRegistryProvider>
    );

    const { result } = renderHook(() => useGameTypeLiveRegistry(), { wrapper });

    // Act
    const resolvedFacade = result.current.resolve('QUIZ');

    // Assert
    expect(resolvedFacade).toBe(facade);
  });

  it('throws when resolving an unregistered live game type', async () => {
    // Arrange
    mocks.runtimeGetAll.mockReturnValue([]);

    const [{ AppGameTypeLiveRegistryProvider }, { useGameTypeLiveRegistry }] = await Promise.all([
      import('./app-game-type-live-registry-provider'),
      import(
        '../../../../../presentation/game-session/live/shared/contexts/game-type-live-registry-context'
      ),
    ]);

    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGameTypeLiveRegistryProvider>{children}</AppGameTypeLiveRegistryProvider>
    );

    const { result } = renderHook(() => useGameTypeLiveRegistry(), { wrapper });

    // Act
    const resolve = () => result.current.resolve('quiz');

    // Assert
    expect(resolve).toThrow(GameTypeRegistryErrorCode.LIVE_FACADE_MISSING);
  });
});
