import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import type { UiPort } from '../../../application/shared/contracts/ui.port';
import { PresentationUiProvider, PresentationUiRoot, usePresentationThemeState } from './provider';

function MockProvider({ children }: PropsWithChildren) {
  return <div data-testid="mock-ui-provider">{children}</div>;
}

function ThemeStateProbe() {
  const {
    activeColorScheme,
    activeThemeId,
    activeThemeName,
    availableColorSchemes,
    availableThemes,
  } = usePresentationThemeState();

  return (
    <div>
      <span data-testid="active-color-scheme">{activeColorScheme}</span>
      <span data-testid="active-theme-id">{activeThemeId}</span>
      <span data-testid="active-theme-name">{activeThemeName}</span>
      <span data-testid="color-scheme-count">{String(availableColorSchemes.length)}</span>
      <span data-testid="theme-count">{String(availableThemes.length)}</span>
    </div>
  );
}

describe('provider', () => {
  describe('PresentationUiRoot()', () => {
    it('renders children through the configured ui provider', () => {
      const uiPort: UiPort = {
        Provider: MockProvider,
        useThemeState: () => ({
          activeColorScheme: 'dark',
          activeThemeId: 'cyber-arcade',
          activeThemeName: 'Cyber Arcade',
          availableColorSchemes: ['light', 'dark'],
          availableThemes: [{ id: 'cyber-arcade', name: 'Cyber Arcade' }],
          setActiveColorScheme: () => undefined,
          setActiveTheme: () => undefined,
        }),
      };

      render(
        <PresentationUiProvider value={uiPort}>
          <PresentationUiRoot>
            <span data-testid="child">child</span>
          </PresentationUiRoot>
        </PresentationUiProvider>,
      );

      expect(screen.getByTestId('mock-ui-provider')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('exposes theme state through the presentation provider hook', () => {
      const uiPort: UiPort = {
        Provider: MockProvider,
        useThemeState: () => ({
          activeColorScheme: 'dark',
          activeThemeId: 'cyber-arcade',
          activeThemeName: 'Cyber Arcade',
          availableColorSchemes: ['light', 'dark'],
          availableThemes: [{ id: 'cyber-arcade', name: 'Cyber Arcade' }],
          setActiveColorScheme: () => undefined,
          setActiveTheme: () => undefined,
        }),
      };

      render(
        <PresentationUiProvider value={uiPort}>
          <ThemeStateProbe />
        </PresentationUiProvider>,
      );

      expect(screen.getByTestId('active-color-scheme')).toHaveTextContent('dark');
      expect(screen.getByTestId('active-theme-id')).toHaveTextContent('cyber-arcade');
      expect(screen.getByTestId('active-theme-name')).toHaveTextContent('Cyber Arcade');
      expect(screen.getByTestId('color-scheme-count')).toHaveTextContent('2');
      expect(screen.getByTestId('theme-count')).toHaveTextContent('1');
    });
  });
});
