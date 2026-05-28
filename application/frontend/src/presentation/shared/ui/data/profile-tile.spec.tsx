import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Button } from '../actions/button';
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

  it('keeps a dedicated highlight slot even when no highlight label is shown', () => {
    renderWithUiProvider(
      <ProfileTile avatarAlt="Morgan avatar" avatarSrc={null} badgeLabel="Player" title="Morgan" />,
    );

    expect(screen.getByTestId('profile-tile-highlight-slot')).toHaveStyle({
      minHeight: '1.5rem',
    });
  });

  it('renders an optional footer action', () => {
    renderWithUiProvider(
      <ProfileTile
        avatarAlt="Morgan avatar"
        avatarSrc={null}
        badgeLabel="Player"
        footerAction={<Button size="sm">Remove</Button>}
        title="Morgan"
      />,
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });
});
