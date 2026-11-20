import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { StatusBanner } from './status-banner';

describe('StatusBanner', () => {
  describe('render()', () => {
    it('renders errors as an alert', () => {
      // Arrange + Act
      renderWithUiProvider(<StatusBanner tone="error">Invalid credentials.</StatusBanner>);

      // Assert
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.');
    });

    it('renders success messages as a status region', () => {
      // Arrange + Act
      renderWithUiProvider(<StatusBanner tone="success">Account created.</StatusBanner>);

      // Assert
      expect(screen.getByRole('status')).toHaveTextContent('Account created.');
    });

    it('renders a presentational icon alongside banner content', () => {
      // Arrange + Act
      const { container } = renderWithUiProvider(<StatusBanner tone="info">Game is ready.</StatusBanner>);

      // Assert
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });
});
