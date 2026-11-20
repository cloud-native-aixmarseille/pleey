import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('renders an image with the given alt text', () => {
    // Arrange + Act
    renderWithUiProvider(<UserAvatar alt="Jane Doe" src="https://example.com/avatars/jane.png" />);

    // Assert
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
      'src',
      'https://example.com/avatars/jane.png',
    );
  });

  it('renders initials when no src is provided', () => {
    // Arrange + Act
    renderWithUiProvider(<UserAvatar alt="Anonymous" />);

    // Assert
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('supports the framed appearance preset', () => {
    // Arrange + Act
    const { container } = renderWithUiProvider(<UserAvatar alt="Jane Doe" appearance="framed" />);

    // Assert
    expect(container.querySelector('.mantine-Avatar-root')).toHaveAttribute(
      'style',
      expect.stringContaining('border: 2px solid var(--ui-color-border-accent);'),
    );
  });
});
