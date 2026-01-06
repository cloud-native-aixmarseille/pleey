import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeaderboardPage from "./LeaderboardPage";
import type { LeaderboardEntry } from "../../../../domains/game/types";

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
    expect(await screen.findByText(/game over/i)).toBeInTheDocument();
  });

  it("displays podium with top 3 players", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    expect(
      await screen.findByText("Player1", undefined, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Player2", undefined, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Player3", undefined, { timeout: 4000 })
    ).toBeInTheDocument();
  });

  it("displays remaining players after podium", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    await waitFor(
      () => {
        expect(screen.getByText("Player4")).toBeInTheDocument();
        expect(screen.getByText("Player5")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it("displays correct scores for each player", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    expect(
      await screen.findByText(/1500 pts/i, undefined, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/1200 pts/i, undefined, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/1000 pts/i, undefined, { timeout: 4000 })
    ).toBeInTheDocument();
  });

  it("calls onNavigate when Play Again button is clicked", async () => {
    const user = userEvent.setup();

    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    await waitFor(
      () => {
        expect(screen.getByText("Play Again")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    const playAgainButton = screen.getByText("Play Again");
    await user.click(playAgainButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders share button", async () => {
    render(<LeaderboardPage leaderboard={mockLeaderboard} />);

    await waitFor(
      () => {
        expect(screen.getByText("Share")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it("renders confetti component", () => {
    const { container } = render(
      <LeaderboardPage leaderboard={mockLeaderboard} />
    );

    const confettiElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(confettiElements.length).toBeGreaterThan(0);
  });
});
