import { fireEvent, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it } from 'vitest';
import type { ThemeDocument } from '../../../../../domains/theme/entities/theme-document';
import { ThemeFixtureFactory } from '../../../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { usePresentationThemeState } from '../../../../shared/ui/provider';
import { usePartyTheme } from './use-party-theme';

function PartyBranding({ document }: { readonly document?: ThemeDocument }) {
  usePartyTheme(document);
  return null;
}

function ThemeReadout() {
  const { activeThemeId, activeThemeName, activeColorScheme, setActiveColorScheme } = usePresentationThemeState();
  return (
    <>
      <output aria-label="Theme">{activeThemeId}</output>
      <output aria-label="Theme name">{activeThemeName}</output>
      <output aria-label="Color scheme">{activeColorScheme}</output>
      <button type="button" onClick={() => setActiveColorScheme('light')}>
        Light mode
      </button>
    </>
  );
}

const fixtures = new ThemeFixtureFactory();
const solarTheme = fixtures.createDocument({ baseThemeId: 'solar-grid', name: 'Solar Grid' });
const cyberTheme = fixtures.createDocument({ name: 'Cyber Arcade' });

describe('usePartyTheme', () => {
  it('applies document overrides and restores the previous tokens when leaving a custom party', () => {
    // Arrange
    const customTheme = fixtures.createDocument({ name: 'Event branding', overrides: { radius: { panel: '12px' } } });
    const { rerender } = renderWithUiProvider(<ThemeReadout />);
    const originalRadius = document.documentElement.style.getPropertyValue('--ui-radius-panel');

    // Act
    rerender(
      <>
        <PartyBranding document={customTheme} />
        <ThemeReadout />
      </>,
    );
    const partyRadius = document.documentElement.style.getPropertyValue('--ui-radius-panel');
    const partyName = screen.getByLabelText('Theme name').textContent;
    rerender(<ThemeReadout />);

    // Assert
    expect(partyRadius).toBe('12px');
    expect(partyName).toBe('Event branding');
    expect(document.documentElement.style.getPropertyValue('--ui-radius-panel')).toBe(originalRadius);
    expect(screen.getByLabelText('Theme name')).toHaveTextContent('Cyber Arcade');
  });

  it('applies loaded party branding, follows party switches, and restores the theme on leaving without changing color scheme', () => {
    // Arrange
    const { rerender } = renderWithUiProvider(
      <StrictMode>
        <PartyBranding />
        <ThemeReadout />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Light mode' }));

    // Act
    rerender(
      <StrictMode>
        <PartyBranding document={solarTheme} />
        <ThemeReadout />
      </StrictMode>,
    );

    const loadedTheme = screen.getByLabelText('Theme').textContent;
    const loadedColorScheme = screen.getByLabelText('Color scheme').textContent;

    // Another party's snapshot arrives.
    rerender(
      <StrictMode>
        <PartyBranding document={cyberTheme} />
        <ThemeReadout />
      </StrictMode>,
    );
    const nextPartyTheme = screen.getByLabelText('Theme').textContent;
    rerender(
      <StrictMode>
        <PartyBranding document={solarTheme} />
        <ThemeReadout />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <ThemeReadout />
      </StrictMode>,
    );

    // Assert
    expect(loadedTheme).toBe('solar-grid');
    expect(loadedColorScheme).toBe('light');
    expect(nextPartyTheme).toBe('cyber-arcade');
    expect(screen.getByLabelText('Theme')).toHaveTextContent('cyber-arcade');
    expect(screen.getByLabelText('Color scheme')).toHaveTextContent('light');
  });
  it('restores the workspace theme after a party route remounts', () => {
    // Arrange
    const { rerender } = renderWithUiProvider(
      <>
        <PartyBranding key="lobby" document={solarTheme} />
        <ThemeReadout />
      </>,
    );

    // Act
    rerender(
      <>
        <PartyBranding key="stage" document={solarTheme} />
        <ThemeReadout />
      </>,
    );
    rerender(<ThemeReadout />);

    // Assert
    expect(screen.getByLabelText('Theme')).toHaveTextContent('cyber-arcade');
  });
});
