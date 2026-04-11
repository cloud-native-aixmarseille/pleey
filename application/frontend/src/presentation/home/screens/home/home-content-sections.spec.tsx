import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import {
  HomeFeaturesSection,
  HomeHowItWorksSection,
  HomeValuePropositionSection,
} from './home-content-sections';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal, {
    changeLanguage: vi.fn(),
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects && key === 'home.howItWorks.steps') {
        return [
          { title: 'Create a room', description: 'Start a live room for your event.' },
          { title: 'Invite players', description: 'Share the pin with players.' },
        ];
      }

      if (options?.returnObjects && key === 'home.features.items') {
        return [
          { label: 'Fast setup', description: 'Launch a game in seconds.' },
          { label: 'Live energy', description: 'Keep the room engaged round after round.' },
        ];
      }

      return key;
    },
  });
});

describe('home-content-sections', () => {
  it('renders the value proposition heading and description', () => {
    renderWithProviders(<HomeValuePropositionSection />);

    expect(
      screen.getByRole('heading', { name: 'home.valueProposition.heading' }),
    ).toBeInTheDocument();
    expect(screen.getByText('home.valueProposition.description')).toBeInTheDocument();
  });

  it('renders the how-it-works steps from translated objects', () => {
    renderWithProviders(<HomeHowItWorksSection />);

    expect(screen.getByText('home.howItWorks.eyebrow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create a room' })).toBeInTheDocument();
    expect(screen.getByText('Share the pin with players.')).toBeInTheDocument();
  });

  it('renders the feature cards from translated objects', () => {
    renderWithProviders(<HomeFeaturesSection />);

    expect(screen.getByText('home.features.eyebrow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fast setup' })).toBeInTheDocument();
    expect(screen.getByText('Keep the room engaged round after round.')).toBeInTheDocument();
  });
});
