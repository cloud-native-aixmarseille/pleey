import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AdminHostLeaderboardView from '../AdminHostLeaderboardView';
import { LeaderboardEntry } from '../../../../shared/types';

const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 1, username: 'Alice', totalPoints: 500, rank: 1 },
  { userId: 2, username: 'Bob', totalPoints: 400, rank: 2 },
  { userId: 3, username: 'Charlie', totalPoints: 300, rank: 3 },
  { userId: 4, username: 'David', totalPoints: 200, rank: 4 },
  { userId: 5, username: 'Eve', totalPoints: 100, rank: 5 },
];

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdminHostLeaderboardView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  const advanceTimers = async (ms: number) => {
    await act(async () => {
      vi.advanceTimersByTime(ms);
      await Promise.resolve();
    });
  };

  it('renders host mode badge', () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    expect(screen.getByText(/HOST VIEW/i)).toBeInTheDocument();
  });

  it('displays game over title', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(600);
    expect(screen.getByText(/GAME OVER/i)).toBeInTheDocument();
  });

  it('displays final leaderboard heading', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(600);
    expect(screen.getByText(/Final Leaderboard/i)).toBeInTheDocument();
  });

  it('displays top 3 players on podium', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(4000);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('displays winner with crown emoji', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(2000);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    const crownElements = screen.getAllByText('👑');
    expect(crownElements.length).toBeGreaterThan(0);
  });

  it('displays points for top players', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(4000);
    expect(screen.getByText(/500 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/400 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/300 pts/i)).toBeInTheDocument();
  });

  it('displays other players below podium', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
    expect(screen.getByText(/200 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/100 pts/i)).toBeInTheDocument();
  });

  it('displays rank numbers for other players', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);
    expect(screen.getByText('#4')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('displays admin controls section', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);
    expect(screen.getByText(/Admin Controls/i)).toBeInTheDocument();
  });

  it('displays back to dashboard button', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);
    expect(
      screen.getByRole('button', { name: /BACK TO ADMIN DASHBOARD/i })
    ).toBeInTheDocument();
  });

  it('displays new game button', async () => {
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);
    expect(screen.getByRole('button', { name: /NEW GAME/i })).toBeInTheDocument();
  });

  it('navigates to admin dashboard when button clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);

    const dashboardButton = screen.getByRole('button', {
      name: /BACK TO ADMIN DASHBOARD/i,
    });
    await user.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('navigates to home when new game button clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<AdminHostLeaderboardView leaderboard={mockLeaderboard} />);

    await advanceTimers(5000);

    const newGameButton = screen.getByRole('button', { name: /NEW GAME/i });
    await user.click(newGameButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles leaderboard with only 1 player', async () => {
    const singlePlayer = [mockLeaderboard[0]];
    renderWithRouter(<AdminHostLeaderboardView leaderboard={singlePlayer} />);

    await advanceTimers(2000);
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Should not render 2nd and 3rd place
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('handles leaderboard with only 2 players', async () => {
    const twoPlayers = mockLeaderboard.slice(0, 2);
    renderWithRouter(<AdminHostLeaderboardView leaderboard={twoPlayers} />);

    await advanceTimers(3000);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Should not render 3rd place
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('does not show other players section when only 3 or fewer players', async () => {
    const threePlayers = mockLeaderboard.slice(0, 3);
    renderWithRouter(<AdminHostLeaderboardView leaderboard={threePlayers} />);

    await advanceTimers(3000);
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Should not show "Other Top Players" heading
    expect(screen.queryByText(/Other Top Players/i)).not.toBeInTheDocument();
  });
});
