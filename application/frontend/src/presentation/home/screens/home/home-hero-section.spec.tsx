import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { HomeHeroSection } from './home-hero-section';

vi.mock('../../../shared/ui/branding/pleey-logo', () => ({
  PleeyLogo: () => <div>logo</div>,
}));

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HomeHeroSection', () => {
  it('renders the hero copy with the dashboard action', () => {
    renderWithProviders(<HomeHeroSection />);

    expect(screen.getByRole('heading', { name: 'home.hero.title' })).toBeInTheDocument();
    expect(screen.getByText('home.hero.tagline')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home.hero.primaryCta/i })).toHaveAttribute(
      'href',
      '/workspace/dashboard',
    );
  });
});
