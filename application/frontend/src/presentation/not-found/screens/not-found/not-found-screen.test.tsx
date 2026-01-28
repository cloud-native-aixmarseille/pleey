import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { NotFoundScreen } from './not-found-screen';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('NotFoundScreen', () => {
  it('renders the 404 code', () => {
    renderWithProviders(<NotFoundScreen />);
    expect(screen.getByText('notFound.code')).toBeInTheDocument();
  });

  it('renders the not-found title heading', () => {
    renderWithProviders(<NotFoundScreen />);
    expect(screen.getByRole('heading', { name: 'notFound.title' })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithProviders(<NotFoundScreen />);
    expect(screen.getByText('notFound.description')).toBeInTheDocument();
  });

  it('renders a recovery navigation area', () => {
    renderWithProviders(<NotFoundScreen />);
    expect(screen.getByRole('navigation', { name: 'notFound.title' })).toBeInTheDocument();
  });

  it('renders a home CTA link', () => {
    renderWithProviders(<NotFoundScreen />);
    const link = screen.getByRole('link', { name: 'notFound.homeCta' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders a dashboard CTA link', () => {
    renderWithProviders(<NotFoundScreen />);
    const link = screen.getByRole('link', { name: 'notFound.dashboardCta' });
    expect(link).toHaveAttribute('href', '/workspace/dashboard');
  });

  it('renders a join-game CTA link', () => {
    renderWithProviders(<NotFoundScreen />);
    const link = screen.getByRole('link', { name: 'notFound.joinCta' });
    expect(link).toHaveAttribute('href', '/game/join');
  });
});
