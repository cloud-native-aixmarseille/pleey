import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { CatalogItemCard } from './catalog-item-card';

describe('CatalogItemCard', () => {
  describe('render()', () => {
    it('renders as an article with the title as a heading', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" />);

      // Assert
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'My Quiz' })).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" description="A fun trivia quiz" />);

      // Assert
      expect(screen.getByText('A fun trivia quiz')).toBeInTheDocument();
    });

    it('renders the description fallback when description is null', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" description={null} descriptionFallback="No description" />);

      // Assert
      expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('renders the badge when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" badge="QUIZ" />);

      // Assert
      expect(screen.getByText('QUIZ')).toBeInTheDocument();
    });

    it('renders metadata lines', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" metadata={['5 questions', 'Created Jan 1']} />);

      // Assert
      expect(screen.getByText('5 questions')).toBeInTheDocument();
      expect(screen.getByText('Created Jan 1')).toBeInTheDocument();
    });

    it('renders actions when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<CatalogItemCard title="My Quiz" actions={<button type="button">Manage</button>} />);

      // Assert
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    });

    it('renders children for extra content', () => {
      // Arrange + Act
      renderWithUiProvider(
        <CatalogItemCard title="My Quiz">
          <span>Extra info</span>
        </CatalogItemCard>,
      );

      // Assert
      expect(screen.getByText('Extra info')).toBeInTheDocument();
    });
  });
});
