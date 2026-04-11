import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ShellHeader } from './shell-header';

describe('ShellHeader', () => {
  describe('render()', () => {
    it('renders kicker, title, subtitle, and navigation', () => {
      renderWithUiProvider(
        <ShellHeader
          kicker="Kicker"
          navigation={<a href="/x">Nav</a>}
          subtitle="Subtitle text"
          title="Header title"
        />,
      );

      expect(screen.getByText('Kicker')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Header title' })).toBeInTheDocument();
      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Nav' })).toHaveAttribute('href', '/x');
    });
  });
});
