import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

vi.mock("../Confetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

describe("AdminHostLeaderboardView", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it("renders host mode badge", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        animationDelays={testAnimationDelays}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("#4")).toBeInTheDocument();
    expect(screen.getByText("#5")).toBeInTheDocument();
  });

  it("displays admin controls section", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText(/Admin Controls/i)).toBeInTheDocument();
  });

  it("displays back to dashboard button", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
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
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(
      screen.getByRole("button", { name: /NEW GAME/i })
    ).toBeInTheDocument();
  });

  it("navigates to admin dashboard when button clicked", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    const dashboardButton = screen.getByRole("button", {
      name: /BACK TO ADMIN DASHBOARD/i,
    });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigates to home when new game button clicked", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    const newGameButton = screen.getByRole("button", { name: /NEW GAME/i });
    fireEvent.click(newGameButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles leaderboard with only 1 player", () => {
    const singlePlayer = [mockLeaderboard[0]];
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={singlePlayer}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Should not render 2nd and 3rd place
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("handles leaderboard with only 2 players", () => {
    const twoPlayers = mockLeaderboard.slice(0, 2);
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={twoPlayers}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Should not render 3rd place
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("does not show other players section when only 3 or fewer players", () => {
    const threePlayers = mockLeaderboard.slice(0, 3);
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={threePlayers}
        initialAnimationStage={5}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Should not show "Other Top Players" heading
    expect(screen.queryByText(/Other Top Players/i)).not.toBeInTheDocument();
  });

  it("allows staged rendering control for testing", () => {
    renderWithRouter(
      <AdminHostLeaderboardView
        leaderboard={mockLeaderboard}
        initialAnimationStage={2}
        disableConfetti
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    expect(screen.queryByText(/Other Top Players/i)).not.toBeInTheDocument();
  });
});
