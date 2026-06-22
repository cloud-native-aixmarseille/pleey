import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { LandingCalloutSurface, LandingHeroSurface, LandingStepBadge } from './landing-sections';

describe('landing-sections', () => {
  it('renders a hero surface with an aria label', () => {
    renderWithUiProvider(
      <LandingHeroSurface ariaLabel="Hero section">
        <span>Hero content</span>
      </LandingHeroSurface>,
    );

    expect(screen.getByLabelText('Hero section')).toBeInTheDocument();
    expect(screen.getByText('Hero content')).toBeInTheDocument();
  });

  it('renders a callout surface', () => {
    renderWithUiProvider(
      <LandingCalloutSurface>
        <span>Callout content</span>
      </LandingCalloutSurface>,
    );

    expect(screen.getByText('Callout content')).toBeInTheDocument();
  });

  it('renders a decorative step badge', () => {
    renderWithUiProvider(<LandingStepBadge stepNumber={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
