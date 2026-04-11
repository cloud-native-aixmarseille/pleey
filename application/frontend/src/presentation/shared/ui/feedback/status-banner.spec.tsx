import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { StatusBanner } from './status-banner';

describe('StatusBanner', () => {
  describe('render()', () => {
    it('renders errors as an alert', () => {
      renderWithUiProvider(<StatusBanner tone="error">Invalid credentials.</StatusBanner>);

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.');
    });

    it('renders success messages as a status region', () => {
      renderWithUiProvider(<StatusBanner tone="success">Account created.</StatusBanner>);

      expect(screen.getByRole('status')).toHaveTextContent('Account created.');
    });

    it('renders a presentational icon alongside banner content', () => {
      const { container } = renderWithUiProvider(
        <StatusBanner tone="info">Game is ready.</StatusBanner>,
      );

      expect(container.querySelector('svg')).not.toBeNull();
    });
  });
});
