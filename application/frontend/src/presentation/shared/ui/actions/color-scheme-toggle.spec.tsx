import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ColorSchemeToggle } from './color-scheme-toggle';

const mocks = vi.hoisted(() => ({
  setActiveColorScheme: vi.fn(),
}));

vi.mock('../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../provider')>();

  return {
    ...actual,
    usePresentationThemeState: () => ({
      activeColorScheme: 'dark' as const,
      activeThemeId: 'cyber-arcade' as const,
      activeThemeName: 'Cyber Arcade',
      availableColorSchemes: ['light', 'dark'] as const,
      availableThemes: [{ id: 'cyber-arcade' as const, name: 'Cyber Arcade' }],
      setActiveColorScheme: mocks.setActiveColorScheme,
      setActiveTheme: vi.fn(),
    }),
  };
});

describe('ColorSchemeToggle', () => {
  it('renders a toggle button with the correct aria-label', () => {
    renderWithUiProvider(<ColorSchemeToggle />);
    expect(
      screen.getByRole('button', { name: 'shared.shell.colorSchemeToggle' }),
    ).toBeInTheDocument();
  });

  it('displays light label when current scheme is dark', () => {
    renderWithUiProvider(<ColorSchemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('shared.shell.colorSchemeLight');
  });

  it('toggles to light on click when current scheme is dark', async () => {
    renderWithUiProvider(<ColorSchemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'shared.shell.colorSchemeToggle' }));
    expect(mocks.setActiveColorScheme).toHaveBeenCalledWith('light');
  });
});
