import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LeaderboardEntry } from '../../../../../../../domains/game-session/entities/leaderboard-entry';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { LeaderboardRow } from './leaderboard-row';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const ENTRY: LeaderboardEntry = {
  rank: 4,
  username: 'Switch',
  totalPoints: 240,
  userId: 10,
};

const AVATAR_URI = 'https://api.example.com/api/avatars/users/10';

describe('LeaderboardRow', () => {
  it('renders the rank, username, and points', () => {
    renderWithProviders(
      <LeaderboardRow avatarUri={AVATAR_URI} entry={ENTRY} isCurrentPlayer={false} />,
    );

    expect(screen.getByText('game.leaderboard.rankLabel (rank=4)')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('game.leaderboard.pointsLabel (points=240)')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Switch' })).toHaveAttribute('src', AVATAR_URI);
  });

  it('shows the you badge when the entry belongs to the current player', () => {
    renderWithProviders(<LeaderboardRow entry={ENTRY} isCurrentPlayer={true} />);

    expect(screen.getByText('game.leaderboard.youBadge')).toBeInTheDocument();
  });

  it('omits the you badge when the entry is not the current player', () => {
    renderWithProviders(<LeaderboardRow entry={ENTRY} isCurrentPlayer={false} />);

    expect(screen.queryByText('game.leaderboard.youBadge')).not.toBeInTheDocument();
  });
});
