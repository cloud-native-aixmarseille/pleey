import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LeaderboardEntry } from '../../../../../../../domains/game-session/entities/leaderboard-entry';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { LeaderboardPodiumCard } from './leaderboard-podium-card';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const ENTRY: LeaderboardEntry = {
  rank: 1,
  username: 'Neo',
  totalPoints: 420,
  userId: 7,
};

const AVATAR_URI = 'https://api.example.com/api/avatars/users/7';

describe('LeaderboardPodiumCard', () => {
  it('renders the winner label for rank 1', () => {
    renderWithProviders(
      <LeaderboardPodiumCard avatarUri={AVATAR_URI} entry={ENTRY} isCurrentPlayer={false} />,
    );

    expect(screen.getByText('game.leaderboard.winnerLabel')).toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
    expect(screen.getByText('game.leaderboard.pointsLabel (points=420)')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Neo' })).toHaveAttribute('src', AVATAR_URI);
  });

  it('renders the rank label for non-winner positions', () => {
    const secondPlace: LeaderboardEntry = { ...ENTRY, rank: 2, username: 'Trinity' };

    renderWithProviders(<LeaderboardPodiumCard entry={secondPlace} isCurrentPlayer={false} />);

    expect(screen.getByText('game.leaderboard.rankLabel (rank=2)')).toBeInTheDocument();
  });

  it('shows the you badge when the entry belongs to the current player', () => {
    renderWithProviders(<LeaderboardPodiumCard entry={ENTRY} isCurrentPlayer={true} />);

    expect(screen.getByText('game.leaderboard.youBadge')).toBeInTheDocument();
  });

  it('omits the you badge when the entry is not the current player', () => {
    renderWithProviders(<LeaderboardPodiumCard entry={ENTRY} isCurrentPlayer={false} />);

    expect(screen.queryByText('game.leaderboard.youBadge')).not.toBeInTheDocument();
  });
});
