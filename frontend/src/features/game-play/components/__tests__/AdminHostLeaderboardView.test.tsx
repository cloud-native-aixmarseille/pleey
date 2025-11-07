import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminHostLeaderboardView from "../AdminHostLeaderboardView";
import { LeaderboardEntry } from "../../../../shared/types";

const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 1, username: "Alice", totalPoints: 500, rank: 1 },
  { userId: 2, username: "Bob", totalPoints: 400, rank: 2 },
  { userId: 3, username: "Charlie", totalPoints: 300, rank: 3 },
  { userId: 4, username: "David", totalPoints: 200, rank: 4 },
  { userId: 5, username: "Eve", totalPoints: 100, rank: 5 },
];

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

vi.mock("../Confetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

describe("AdminHostLeaderboardView", () => {
  const advanceAnimations = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  const renderWithRouter = (component: ReactElement) =>
    render(<MemoryRouter>{component}</MemoryRouter>);

  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders host mode badge", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(0);

    expect(screen.getByText(/HOST VIEW/i)).toBeInTheDocument();
  });

  it("displays game over title", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(600);

    expect(screen.getByText(/GAME OVER/i)).toBeInTheDocument();
  });

  it("displays final leaderboard heading", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(600);

    expect(screen.getByText(/Final Leaderboard/i)).toBeInTheDocument();
  });

  it("displays top 3 players on podium", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(4000);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("displays winner with crown emoji", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(2000);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    const crownElements = screen.getAllByText("👑");
    expect(crownElements.length).toBeGreaterThan(0);
  });

  it("displays points for top players", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(4000);

    expect(screen.getByText(/500 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/400 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/300 pts/i)).toBeInTheDocument();
  });

  it("displays other players below podium", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    expect(screen.getByText("David")).toBeInTheDocument();
    expect(screen.getByText("Eve")).toBeInTheDocument();
    expect(screen.getByText(/200 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/100 pts/i)).toBeInTheDocument();
  });

  it("displays rank numbers for other players", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    expect(screen.getByText("#4")).toBeInTheDocument();
    expect(screen.getByText("#5")).toBeInTheDocument();
  });

  it("displays admin controls section", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    expect(screen.getByText(/Admin Controls/i)).toBeInTheDocument();
  });

  it("displays back to dashboard button", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    expect(
      screen.getByRole("button", { name: /BACK TO ADMIN DASHBOARD/i })
    ).toBeInTheDocument();
  });

  it("displays new game button", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    expect(
      screen.getByRole("button", { name: /NEW GAME/i })
    ).toBeInTheDocument();
  });

  it("navigates to admin dashboard when button clicked", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    const dashboardButton = screen.getByRole("button", {
      name: /BACK TO ADMIN DASHBOARD/i,
    });
    act(() => {
      fireEvent.click(dashboardButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigates to home when new game button clicked", () => {
    renderWithRouter(
      <AdminHostLeaderboardView leaderboard={mockLeaderboard} />
    );
    advanceAnimations(5000);

    const newGameButton = screen.getByRole("button", { name: /NEW GAME/i });
    act(() => {
      fireEvent.click(newGameButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles leaderboard with only 1 player", () => {
    const singlePlayer = [mockLeaderboard[0]];
    renderWithRouter(<AdminHostLeaderboardView leaderboard={singlePlayer} />);
    advanceAnimations(2000);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("handles leaderboard with only 2 players", () => {
    const twoPlayers = mockLeaderboard.slice(0, 2);
    renderWithRouter(<AdminHostLeaderboardView leaderboard={twoPlayers} />);
    advanceAnimations(3000);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("does not show other players section when only 3 or fewer players", () => {
    const threePlayers = mockLeaderboard.slice(0, 3);
    renderWithRouter(<AdminHostLeaderboardView leaderboard={threePlayers} />);
    advanceAnimations(5000);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText(/Other Top Players/i)).not.toBeInTheDocument();
  });
});
