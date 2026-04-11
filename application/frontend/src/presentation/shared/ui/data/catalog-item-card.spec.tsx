import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { CatalogItemCard } from './catalog-item-card';

describe('CatalogItemCard', () => {
  describe('render()', () => {
    it('renders as an article with the title as a heading', () => {
      renderWithUiProvider(<CatalogItemCard title="My Quiz" />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'My Quiz' })).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
      renderWithUiProvider(<CatalogItemCard title="My Quiz" description="A fun trivia quiz" />);

      expect(screen.getByText('A fun trivia quiz')).toBeInTheDocument();
    });

    it('renders the description fallback when description is null', () => {
      renderWithUiProvider(
        <CatalogItemCard title="My Quiz" description={null} descriptionFallback="No description" />,
      );

      expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('renders the badge when provided', () => {
      renderWithUiProvider(<CatalogItemCard title="My Quiz" badge="QUIZ" />);

      expect(screen.getByText('QUIZ')).toBeInTheDocument();
    });

    it('renders metadata lines', () => {
      renderWithUiProvider(
        <CatalogItemCard title="My Quiz" metadata={['5 questions', 'Created Jan 1']} />,
      );

      expect(screen.getByText('5 questions')).toBeInTheDocument();
      expect(screen.getByText('Created Jan 1')).toBeInTheDocument();
    });

    it('renders actions when provided', () => {
      renderWithUiProvider(
        <CatalogItemCard title="My Quiz" actions={<button type="button">Manage</button>} />,
      );

      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    });

    it('renders children for extra content', () => {
      renderWithUiProvider(
        <CatalogItemCard title="My Quiz">
          <span>Extra info</span>
        </CatalogItemCard>,
      );

      expect(screen.getByText('Extra info')).toBeInTheDocument();
    });
  });
});
