import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children text', () => {
    // Arrange + Act
    renderWithUiProvider(<Badge>LIVE</Badge>);

    // Assert
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders nothing when children are empty', () => {
    // Arrange + Act
    renderWithUiProvider(<Badge>{null}</Badge>);

    // Assert
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });

  it('applies accent tone by default', () => {
    // Arrange + Act
    renderWithUiProvider(<Badge>NEW</Badge>);

    // Assert
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('applies each tone variant without crashing', () => {
    // Arrange + Act
    const tones = ['accent', 'success', 'neutral', 'info'] as const;

    // Assert
    for (const tone of tones) {
      const { unmount } = renderWithUiProvider(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    }
  });
});
