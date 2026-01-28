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
});
