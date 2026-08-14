import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import {
  type PartyGameTypeRuntimeRegistry,
  PartyGameTypeRuntimeRegistryProvider,
  usePartyGameTypeRuntimeRegistry,
} from './party-game-type-runtime-registry-context';

const runtimeGameType = Object.values(GameType)[0] as GameType;

describe('partyGameTypeRuntimeRegistryContext', () => {
  describe('usePartyGameTypeRuntimeRegistry()', () => {
    it('returns the registry from context', () => {
      // Arrange
      const registry: PartyGameTypeRuntimeRegistry = {
        resolve: (gameType) =>
          gameType === runtimeGameType
            ? {
                renderHostResultPanel: () => null,
                renderHostStagePanel: () => null,
                renderPlayerResultSurface: () => null,
                renderPlayerStageSurface: () => null,
              }
            : null,
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <PartyGameTypeRuntimeRegistryProvider value={registry}>{children}</PartyGameTypeRuntimeRegistryProvider>
      );

      // Act
      const { result } = renderHook(() => usePartyGameTypeRuntimeRegistry(), { wrapper });

      // Assert
      expect(result.current).toBe(registry);
    });

    it('throws when called without the provider', () => {
      // Arrange + Act
      const renderWithoutProvider = () => renderHook(() => usePartyGameTypeRuntimeRegistry());

      // Assert
      expect(renderWithoutProvider).toThrow(
        PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
      );
    });
  });
});
