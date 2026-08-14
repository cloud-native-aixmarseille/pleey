import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Eyebrow, Heading, SummaryText, SupportingText } from './typography';

describe('typography', () => {
  describe('Eyebrow()', () => {
    it('renders overline text', () => {
      // Arrange + Act
      renderWithUiProvider(<Eyebrow>Overline</Eyebrow>);

      // Assert
      expect(screen.getByText('Overline')).toBeInTheDocument();
    });
  });

  describe('Heading()', () => {
    it('renders a heading at the given level', () => {
      // Arrange + Act
      renderWithUiProvider(<Heading level={3}>Section Title</Heading>);

      // Assert
      expect(screen.getByRole('heading', { level: 3, name: 'Section Title' })).toBeInTheDocument();
    });

    it('defaults to level 2', () => {
      // Arrange + Act
      renderWithUiProvider(<Heading>Default Title</Heading>);

      // Assert
      expect(screen.getByRole('heading', { level: 2, name: 'Default Title' })).toBeInTheDocument();
    });
  });

  describe('SupportingText()', () => {
    it('renders secondary text', () => {
      // Arrange + Act
      renderWithUiProvider(<SupportingText>Help text</SupportingText>);

      // Assert
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  describe('SummaryText()', () => {
    it('renders emphasized text', () => {
      // Arrange + Act
      renderWithUiProvider(<SummaryText>Summary value</SummaryText>);

      // Assert
      expect(screen.getByText('Summary value')).toBeInTheDocument();
    });
  });
});
