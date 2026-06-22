import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { InlineStatPill } from './inline-stat-pill';

describe('InlineStatPill', () => {
  it('renders the icon and label content', () => {
    renderWithUiProvider(
      <InlineStatPill icon={<span data-testid="inline-stat-icon">Icon</span>}>
        120 seconds
      </InlineStatPill>,
    );

    expect(screen.getByTestId('inline-stat-icon')).toBeInTheDocument();
    expect(screen.getByText('120 seconds')).toBeInTheDocument();
  });

  it('renders nothing when no content is provided', () => {
    renderWithUiProvider(
      <InlineStatPill icon={<span data-testid="inline-stat-icon">Icon</span>}>
        {null}
      </InlineStatPill>,
    );

    expect(screen.queryByTestId('inline-stat-icon')).not.toBeInTheDocument();
    expect(screen.queryByText('Icon')).not.toBeInTheDocument();
  });
});
