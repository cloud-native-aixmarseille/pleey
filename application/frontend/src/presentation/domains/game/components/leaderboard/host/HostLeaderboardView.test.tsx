import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HostLeaderboardView from "./HostLeaderboardView";
import type { LeaderboardEntry } from "../../../../../../domains/game/types";

const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 1, username: "Alice", totalPoints: 500, rank: 1 },
  { userId: 2, username: "Bob", totalPoints: 400, rank: 2 },
  { userId: 3, username: "Charlie", totalPoints: 300, rank: 3 },
  { userId: 4, username: "David", totalPoints: 200, rank: 4 },
  { userId: 5, username: "Eve", totalPoints: 100, rank: 5 },
];

const testAnimationDelays = {
  title: 1,
  firstPlace: 2,
  secondPlace: 3,
  thirdPlace: 4,
  remainingPlayers: 5,
};

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

vi.mock("./Confetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

describe("HostLeaderboardView", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it("renders host mode badge", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/HOST VIEW/i)).toBeInTheDocument();
  });

  it("displays game over title", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/GAME OVER/i)).toBeInTheDocument();
  });

  it("displays final leaderboard heading", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/Final Leaderboard/i)).toBeInTheDocument();
  });

  it("displays top 3 players on podium", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("displays winner with crown emoji", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    const crownElements = screen.getAllByText("👑");
    expect(crownElements.length).toBeGreaterThan(0);
  });

  it("displays points for top players", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/500 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/400 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/300 pts/i)).toBeInTheDocument();
  });

  it("displays other players below podium", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("David")).toBeInTheDocument();
    expect(screen.getByText("Eve")).toBeInTheDocument();
    expect(screen.getByText(/200 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/100 pts/i)).toBeInTheDocument();
  });

  it("displays rank numbers for other players", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("#4")).toBeInTheDocument();
    expect(screen.getByText("#5")).toBeInTheDocument();
  });

  it("displays host controls section", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/Host Controls/i)).toBeInTheDocument();
  });

  it("displays back to dashboard button", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(
      screen.getByRole("button", { name: /BACK TO ADMIN DASHBOARD/i })
    ).toBeInTheDocument();
  });

  it("displays new game button", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(
      screen.getByRole("button", { name: /NEW GAME/i })
    ).toBeInTheDocument();
  });

  it("navigates to host dashboard when button clicked", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    const dashboardButton = screen.getByRole("button", {
      name: /BACK TO ADMIN DASHBOARD/i,
    });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
  });

  it("navigates to home when new game button clicked", () => {
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    const newGameButton = screen.getByRole("button", { name: /NEW GAME/i });
    fireEvent.click(newGameButton);

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("handles leaderboard with only 1 player", () => {
    const singlePlayer = [mockLeaderboard[0]];
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={singlePlayer}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("handles leaderboard with only 2 players", () => {
    const twoPlayers = mockLeaderboard.slice(0, 2);
    renderWithRouter(
      <HostLeaderboardView
        leaderboard={twoPlayers}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });
});
