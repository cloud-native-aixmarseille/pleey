import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { HomeClosingCtaSection } from './home-closing-cta-section';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HomeClosingCtaSection', () => {
  it('renders the closing call to action with the register link', () => {
    renderWithProviders(<HomeClosingCtaSection />);

    expect(screen.getByRole('heading', { name: 'home.closingCta.heading' })).toBeInTheDocument();
    expect(screen.getByText('home.closingCta.description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home.closingCta.primaryCta/i })).toHaveAttribute(
      'href',
      '/identity/register',
    );
  });
});
