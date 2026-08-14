import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { HomeScreen } from './home-screen';

const MOCK_STEPS = [
  { title: 'step-1-title', description: 'step-1-desc' },
  { title: 'step-2-title', description: 'step-2-desc' },
  { title: 'step-3-title', description: 'step-3-desc' },
];

const MOCK_FEATURES = [
  { label: 'feat-1-label', description: 'feat-1-desc' },
  { label: 'feat-2-label', description: 'feat-2-desc' },
  { label: 'feat-3-label', description: 'feat-3-desc' },
  { label: 'feat-4-label', description: 'feat-4-desc' },
];

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    usePresentationTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        if (key === 'home.howItWorks.steps' && options?.returnObjects) {
          return MOCK_STEPS;
        }
        if (key === 'home.features.items' && options?.returnObjects) {
          return MOCK_FEATURES;
        }
        return key;
      },
    }),
  };
});

describe('HomeScreen', () => {
  describe('hero section', () => {
    it('renders the hero as a labelled section', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByRole('region', { name: 'home.hero.eyebrow' })).toBeInTheDocument();
    });

    it('renders the Pleey logo asset in the hero', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByRole('img', { name: 'shared.branding.logoAlt' })).toBeInTheDocument();
    });

    it('renders the hero title as h1', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByRole('heading', { level: 1, name: 'home.hero.title' })).toBeInTheDocument();
    });

    it('renders the hero tagline', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByText('home.hero.tagline')).toBeInTheDocument();
    });

    it('renders the dashboard CTA link', () => {
      // Arrange
      renderWithProviders(<HomeScreen />);
      // Act
      const link = screen.getByRole('link', { name: 'home.hero.primaryCta' });
      // Assert
      expect(link).toHaveAttribute('href', '/workspace/dashboard');
    });
  });

  describe('value proposition section', () => {
    it('renders the value proposition heading', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByRole('heading', { name: 'home.valueProposition.heading' })).toBeInTheDocument();
    });

    it('renders the value proposition description', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByText('home.valueProposition.description')).toBeInTheDocument();
    });
  });

  describe('how-it-works section', () => {
    it('renders the how-it-works eyebrow', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByText('home.howItWorks.eyebrow')).toBeInTheDocument();
    });

    it('renders step cards as articles with headings', () => {
      // Arrange
      renderWithProviders(<HomeScreen />);
      // Act
      const articles = screen.getAllByRole('article');
      // Assert
      expect(articles.length).toBeGreaterThanOrEqual(MOCK_STEPS.length);
      for (const step of MOCK_STEPS) {
        expect(screen.getByRole('heading', { name: step.title })).toBeInTheDocument();
      }
    });

    it('renders step numbers 1 through 3', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('features section', () => {
    it('renders the features eyebrow', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByText('home.features.eyebrow')).toBeInTheDocument();
    });

    it('renders all feature labels as headings', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      for (const feat of MOCK_FEATURES) {
        expect(screen.getByRole('heading', { name: feat.label })).toBeInTheDocument();
      }
    });
  });

  describe('closing CTA section', () => {
    it('renders the closing heading', () => {
      // Arrange + Act
      renderWithProviders(<HomeScreen />);
      // Assert
      expect(screen.getByRole('heading', { name: 'home.closingCta.heading' })).toBeInTheDocument();
    });

    it('renders a register CTA link', () => {
      // Arrange
      renderWithProviders(<HomeScreen />);
      // Act
      const link = screen.getByRole('link', { name: 'home.closingCta.primaryCta' });
      // Assert
      expect(link).toHaveAttribute('href', '/identity/register');
    });
  });
});
