import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeaderboardPage from '../LeaderboardPage';
import { LeaderboardEntry } from '../../../../shared/types';

describe('LeaderboardPage', () => {
  const mockLeaderboard: LeaderboardEntry[] = [
    { username: 'Player1', totalPoints: 1500, userId: 1 },
    { username: 'Player2', totalPoints: 1200, userId: 2 },
    { username: 'Player3', totalPoints: 1000, userId: 3 },
    { username: 'Player4', totalPoints: 800, userId: 4 },
    { username: 'Player5', totalPoints: 600, userId: 5 },
  ];

  const mockOnNavigate = vi.fn();

  it('renders game over title', () => {
    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
  });

  it('displays podium with top 3 players', async () => {
    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    // Wait for animations to complete
    await waitFor(
      () => {
        expect(screen.getByText('Player1')).toBeInTheDocument();
        expect(screen.getByText('Player2')).toBeInTheDocument();
        expect(screen.getByText('Player3')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays remaining players after podium', async () => {
    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Player4')).toBeInTheDocument();
        expect(screen.getByText('Player5')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('displays correct scores for each player', async () => {
    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('1500 pts')).toBeInTheDocument();
        expect(screen.getByText('1200 pts')).toBeInTheDocument();
        expect(screen.getByText('1000 pts')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('calls onNavigate when Play Again button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Play Again')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    const playAgainButton = screen.getByText('Play Again');
    await user.click(playAgainButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  it('renders share button', async () => {
    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Share Results')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('renders confetti component', () => {
    const { container } = render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    // Check if confetti container exists (it's a fixed overlay)
    const confettiElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it('handles empty leaderboard gracefully', async () => {
    render(
      <LeaderboardPage
        leaderboard={[]}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles single player leaderboard', async () => {
    const singlePlayer: LeaderboardEntry[] = [
      { username: 'Solo', totalPoints: 2000, userId: 1 },
    ];

    render(
      <LeaderboardPage
        leaderboard={singlePlayer}
        onNavigate={mockOnNavigate}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Solo')).toBeInTheDocument();
        expect(screen.getByText('2000 pts')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('respects animation timing sequence', async () => {
    const { container } = render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        onNavigate={mockOnNavigate}
      />
    );

    // Title should appear first (after 500ms)
    await waitFor(
      () => {
        expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // 1st place should appear (after 1500ms)
    await waitFor(
      () => {
        expect(screen.getByText('Player1')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // 2nd place should appear (after 2200ms)
    await waitFor(
      () => {
        expect(screen.getByText('Player2')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );

    // 3rd place should appear (after 2900ms)
    await waitFor(
      () => {
        expect(screen.getByText('Player3')).toBeInTheDocument();
      },
      { timeout: 3200 }
    );
  });
});
