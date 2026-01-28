import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOLAR_GRID_THEME_ID } from '../../presentation/shared/ui/foundation/solar-grid-theme';
import { MantineUiAdapter } from './mantine-ui.adapter';

describe('MantineUiAdapter', () => {
  describe('createPort()', () => {
    it('returns a provider that renders children', () => {
      const adapter = new MantineUiAdapter({});
      const port = adapter.createPort();

      render(
        <port.Provider>
          <span data-testid="child">child</span>
        </port.Provider>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('exposes theme and color scheme state and allows switching both', () => {
      const adapter = new MantineUiAdapter();
      const port = adapter.createPort();

      function ThemeConsumer() {
        const {
          activeColorScheme,
          activeThemeId,
          activeThemeName,
          availableColorSchemes,
          availableThemes,
          setActiveColorScheme,
          setActiveTheme,
        } = port.useThemeState();

        return (
          <>
            <span data-testid="active-color-scheme">{activeColorScheme}</span>
            <span data-testid="active-theme-id">{activeThemeId}</span>
            <span data-testid="active-theme-name">{activeThemeName}</span>
            <span data-testid="color-scheme-count">{String(availableColorSchemes.length)}</span>
            <span data-testid="theme-count">{String(availableThemes.length)}</span>
            <button onClick={() => setActiveColorScheme('light')} type="button">
              switch color scheme
            </button>
            <button onClick={() => setActiveTheme(SOLAR_GRID_THEME_ID)} type="button">
              switch theme
            </button>
          </>
        );
      }

      render(
        <port.Provider>
          <ThemeConsumer />
        </port.Provider>,
      );

      expect(screen.getByTestId('active-color-scheme')).toHaveTextContent('dark');
      expect(screen.getByTestId('active-theme-id')).toHaveTextContent('cyber-arcade');
      expect(screen.getByTestId('active-theme-name')).toHaveTextContent('Cyber Arcade');
      expect(screen.getByTestId('color-scheme-count')).toHaveTextContent('2');
      expect(screen.getByTestId('theme-count')).toHaveTextContent('2');

      fireEvent.click(screen.getByRole('button', { name: 'switch color scheme' }));

      expect(screen.getByTestId('active-color-scheme')).toHaveTextContent('light');

      fireEvent.click(screen.getByRole('button', { name: 'switch theme' }));

      expect(screen.getByTestId('active-theme-id')).toHaveTextContent('solar-grid');
      expect(screen.getByTestId('active-theme-name')).toHaveTextContent('Solar Grid');
    });

    it('applies the active color scheme to runtime theme attributes', () => {
      const adapter = new MantineUiAdapter({ defaultColorScheme: 'light' });
      const port = adapter.createPort();

      render(
        <port.Provider>
          <span data-testid="child">child</span>
        </port.Provider>,
      );

      const themedRoot = screen.getByTestId('child').parentElement;

      expect(themedRoot).toHaveAttribute('data-ui-color-scheme', 'light');
      expect(themedRoot).toHaveAttribute('data-ui-theme', 'cyber-arcade');
      expect(themedRoot).toHaveStyle({ '--ui-color-surface-canvas': '#fff8fc' });
    });
  });
});
