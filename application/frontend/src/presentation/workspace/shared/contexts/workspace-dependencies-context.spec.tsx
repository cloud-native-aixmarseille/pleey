import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PresentationContextErrorCode } from '../../../../domains/shared/errors/presentation-context-error-code';
import {
  provideWorkspaceDependencies,
  useWorkspaceDependencies,
  type WorkspaceDependencies,
} from './workspace-dependencies-context';

describe('workspaceDependenciesContext', () => {
  describe('useWorkspaceDependencies()', () => {
    it('returns the dependencies from context', () => {
      // Arrange
      const dependencies: WorkspaceDependencies = {
        gameTypeParser: {
          parseOrNull: () => null,
        },
        organizationFormFacade: {} as never,
        organizationIdentifier: {
          parseOrNull: () => 7 as never,
        },
        projectFormFacade: {} as never,
        projectIdentifier: {
          parseOrNull: () => 11 as never,
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) =>
        provideWorkspaceDependencies(children, dependencies);

      // Act
      const { result } = renderHook(() => useWorkspaceDependencies(), { wrapper });

      // Assert
      expect(result.current).toBe(dependencies);
    });

    it('throws when called without the provider', () => {
      // Arrange + Act
      const renderWithoutProvider = () => renderHook(() => useWorkspaceDependencies());

      // Assert
      expect(renderWithoutProvider).toThrow(
        PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
      );
    });
  });
});
