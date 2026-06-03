import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Eyebrow, Heading, SummaryText, SupportingText } from './typography';

describe('typography', () => {
  describe('Eyebrow()', () => {
    it('renders overline text', () => {
      renderWithUiProvider(<Eyebrow>Overline</Eyebrow>);

      expect(screen.getByText('Overline')).toBeInTheDocument();
    });
  });

  describe('Heading()', () => {
    it('renders a heading at the given level', () => {
      renderWithUiProvider(<Heading level={3}>Section Title</Heading>);

      expect(screen.getByRole('heading', { level: 3, name: 'Section Title' })).toBeInTheDocument();
    });

    it('defaults to level 2', () => {
      renderWithUiProvider(<Heading>Default Title</Heading>);

      expect(screen.getByRole('heading', { level: 2, name: 'Default Title' })).toBeInTheDocument();
    });
  });

  describe('SupportingText()', () => {
    it('renders secondary text', () => {
      renderWithUiProvider(<SupportingText>Help text</SupportingText>);

      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  describe('SummaryText()', () => {
    it('renders emphasized text', () => {
      renderWithUiProvider(<SummaryText>Summary value</SummaryText>);

      expect(screen.getByText('Summary value')).toBeInTheDocument();
    });
  });
});
