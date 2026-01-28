import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { SubpageHeader } from './subpage-header';

describe('SubpageHeader', () => {
  describe('render()', () => {
    it('renders kicker, title, and subtitle', () => {
      renderWithUiProvider(
        <SubpageHeader kicker="Section" subtitle="Helpful context" title="Page Title" />,
      );

      expect(screen.getByText('Section')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Page Title' })).toBeInTheDocument();
      expect(screen.getByText('Helpful context')).toBeInTheDocument();
    });

    it('renders the actions slot when provided', () => {
      renderWithUiProvider(
        <SubpageHeader
          actions={<button type="button">Back</button>}
          kicker="Section"
          subtitle="Helpful context"
          title="Page Title"
        />,
      );

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('renders without actions when none provided', () => {
      const { container } = renderWithUiProvider(
        <SubpageHeader kicker="Section" subtitle="Helpful context" title="Page Title" />,
      );

      expect(container.querySelector('header')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
