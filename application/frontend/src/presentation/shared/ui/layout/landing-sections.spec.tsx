import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { LandingCalloutSurface, LandingHeroSurface, LandingStepBadge } from './landing-sections';

describe('landing-sections', () => {
  it('renders a hero surface with an aria label', () => {
    // Arrange + Act
    renderWithUiProvider(
      <LandingHeroSurface ariaLabel="Hero section">
        <span>Hero content</span>
      </LandingHeroSurface>,
    );

    // Assert
    expect(screen.getByLabelText('Hero section')).toBeInTheDocument();
    expect(screen.getByText('Hero content')).toBeInTheDocument();
  });

  it('renders a callout surface', () => {
    // Arrange + Act
    renderWithUiProvider(
      <LandingCalloutSurface>
        <span>Callout content</span>
      </LandingCalloutSurface>,
    );

    // Assert
    expect(screen.getByText('Callout content')).toBeInTheDocument();
  });

  it('renders a decorative step badge', () => {
    // Arrange + Act
    renderWithUiProvider(<LandingStepBadge stepNumber={3} />);

    // Assert
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
