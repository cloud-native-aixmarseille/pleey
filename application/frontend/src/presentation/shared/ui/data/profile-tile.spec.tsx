import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ProfileTile } from './profile-tile';

describe('ProfileTile', () => {
  it('renders the player identity and role badge', () => {
    renderWithUiProvider(
      <ProfileTile
        avatarAlt="Casey avatar"
        avatarSrc={null}
        badgeLabel="Player"
        highlightLabel="You"
        highlighted
        title="Casey"
      />,
    );

    expect(screen.getByText('Casey')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
