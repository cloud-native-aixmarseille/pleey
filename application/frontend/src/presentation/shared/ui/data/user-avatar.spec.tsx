import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('renders an image with the given alt text', () => {
    renderWithUiProvider(<UserAvatar alt="Jane Doe" src="https://example.com/avatars/jane.png" />);

    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
      'src',
      'https://example.com/avatars/jane.png',
    );
  });

  it('renders initials when no src is provided', () => {
    renderWithUiProvider(<UserAvatar alt="Anonymous" />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('supports the framed appearance preset', () => {
    const { container } = renderWithUiProvider(<UserAvatar alt="Jane Doe" appearance="framed" />);

    expect(container.querySelector('.mantine-Avatar-root')).toHaveAttribute(
      'style',
      expect.stringContaining('border: 2px solid var(--ui-color-border-accent);'),
    );
  });
});
