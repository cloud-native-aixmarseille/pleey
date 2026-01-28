import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children text', () => {
    renderWithUiProvider(<Badge>LIVE</Badge>);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders nothing when children are empty', () => {
    renderWithUiProvider(<Badge>{null}</Badge>);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });

  it('applies accent tone by default', () => {
    renderWithUiProvider(<Badge>NEW</Badge>);

    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('applies each tone variant without crashing', () => {
    const tones = ['accent', 'success', 'neutral', 'info'] as const;

    for (const tone of tones) {
      const { unmount } = renderWithUiProvider(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    }
  });
});
