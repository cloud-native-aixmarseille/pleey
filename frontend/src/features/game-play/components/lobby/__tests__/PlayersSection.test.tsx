import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayersSection from "../PlayersSection";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "game.connectedPlayers": "Connected Players",
        "game.ready": "Ready",
        "game.waiting": "Waiting",
        "game.noPlayersYetTitle": "No players yet",
        "game.sharePin": "Share the PIN",
      };
      return translations[key] || key;
    },
  }),
}));

describe("PlayersSection", () => {
  const mockPlayers = [
    {
      id: 1,
      username: "Player1",
      avatar: "/api/avatars/sessions/10/user-1",
    },
    {
      id: 2,
      username: "Player2",
      avatar: "/api/avatars/sessions/10/user-2",
    },
  ];

  it("should render player avatars from server data", () => {
    render(
      <PlayersSection players={mockPlayers} sectionTitleId="test-section" />
    );

    const avatarImages = screen.getAllByRole("img");
    expect(avatarImages).toHaveLength(2);
    expect(avatarImages[0].getAttribute("src")).toContain(
      mockPlayers[0].avatar
    );
    expect(avatarImages[1].getAttribute("src")).toContain(
      mockPlayers[1].avatar
    );
  });

  it("should render player usernames", () => {
    render(
      <PlayersSection players={mockPlayers} sectionTitleId="test-section" />
    );

    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should display player count", () => {
    render(
      <PlayersSection players={mockPlayers} sectionTitleId="test-section" />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should render empty state when no players", () => {
    render(<PlayersSection players={[]} sectionTitleId="test-section" />);

    expect(screen.getByText("No players yet")).toBeInTheDocument();
    expect(screen.getByText("Share the PIN")).toBeInTheDocument();
  });

  it("should render filler slots for less than 8 players", () => {
    const singlePlayer = [mockPlayers[0]];
    render(
      <PlayersSection players={singlePlayer} sectionTitleId="test-section" />
    );

    // Should show 3 filler slots (min of 3 or 8-1)
    const waitingTexts = screen.getAllByText("Waiting");
    expect(waitingTexts.length).toBeGreaterThanOrEqual(3);
  });

  it("should display different avatars for different players", () => {
    const playersWithDifferentAvatars = [
      {
        id: 1,
        username: "Player1",
        avatar: "/api/avatars/sessions/11/user-1",
      },
      {
        id: 2,
        username: "Player2",
        avatar: "/api/avatars/sessions/11/user-2",
      },
    ];

    render(
      <PlayersSection
        players={playersWithDifferentAvatars}
        sectionTitleId="test-section"
      />
    );

    const avatarImages = screen.getAllByRole("img");
    expect(avatarImages[0].getAttribute("src")).not.toBe(
      avatarImages[1].getAttribute("src")
    );
  });
});
