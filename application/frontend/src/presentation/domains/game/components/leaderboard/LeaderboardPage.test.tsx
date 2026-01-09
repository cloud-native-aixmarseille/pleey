import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import LeaderboardPage from "./LeaderboardPage";
import type { LeaderboardEntry } from "../../../../../domains/game/types";
import { LEADERBOARD_ANIMATION_TIMINGS } from "./constants";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LeaderboardPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockLeaderboard: LeaderboardEntry[] = [
    { username: "Player1", totalPoints: 1500, userId: 1, rank: 1 },
    { username: "Player2", totalPoints: 1200, userId: 2, rank: 2 },
    { username: "Player3", totalPoints: 1000, userId: 3, rank: 3 },
    { username: "Player4", totalPoints: 800, userId: 4, rank: 4 },
    { username: "Player5", totalPoints: 600, userId: 5, rank: 5 },
  ];

  it("renders game over title", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.title);
    });

    expect(screen.getByText(/game over/i)).toBeInTheDocument();
  });

  it("displays podium with top 3 players", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.thirdPlace);
    });

    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Player3")).toBeInTheDocument();
  });

  it("displays remaining players after podium", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.rest);
    });

    expect(screen.getByText("Player4")).toBeInTheDocument();
    expect(screen.getByText("Player5")).toBeInTheDocument();
  });

  it("displays correct scores for each player", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.thirdPlace);
    });

    expect(screen.getByText(/1500 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/1200 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/1000 pts/i)).toBeInTheDocument();
  });

  it("calls onNavigate when Play Again button is clicked", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.rest);
    });

    const playAgainButton = screen.getByText("Play Again");
    fireEvent.click(playAgainButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders share button", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    act(() => {
      vi.advanceTimersByTime(LEADERBOARD_ANIMATION_TIMINGS.rest);
    });

    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("renders confetti component", () => {
    const { container } = render(
      <LeaderboardPage leaderboard={mockLeaderboard} />
    );

    const confettiElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it("renders paused overlay when session is paused (player view)", () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} isPaused />);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("does not render paused overlay for host view", () => {
    const onTogglePause = vi.fn();

    render(
      <LeaderboardPage
        leaderboard={mockLeaderboard}
        isHost
        isPaused
        onTogglePause={onTogglePause}
      />
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("paused-host-banner")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume/i }));
    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });
});
