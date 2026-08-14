import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { SectionCard } from './section-card';

describe('SectionCard', () => {
  describe('render()', () => {
    it('renders the title as a heading', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="My title" />);

      // Assert
      expect(screen.getByRole('heading', { name: 'My title' })).toBeInTheDocument();
    });

    it('renders the eyebrow when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="Title" eyebrow="EYEBROW" />);

      // Assert
      expect(screen.getByText('EYEBROW')).toBeInTheDocument();
    });

    it('does not render an eyebrow element when omitted', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="Title" />);

      // Assert
      expect(screen.queryByText('EYEBROW')).not.toBeInTheDocument();
    });

    it('renders the description when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="Title" description="Card description text" />);

      // Assert
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('does not render a description element when omitted', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="Title" />);

      // Assert
      expect(screen.queryByText('Card description text')).not.toBeInTheDocument();
    });

    it('renders children inside the card', () => {
      // Arrange + Act
      renderWithUiProvider(
        <SectionCard title="Title">
          <span data-testid="child-node">child</span>
        </SectionCard>,
      );

      // Assert
      expect(screen.getByTestId('child-node')).toBeInTheDocument();
    });

    it('renders the footer when provided', () => {
      // Arrange + Act
      renderWithUiProvider(<SectionCard title="Title" footer={<span>Footer content</span>} />);

      // Assert
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });
});
