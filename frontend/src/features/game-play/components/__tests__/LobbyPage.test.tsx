import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LobbyPage from "../LobbyPage";

describe("LobbyPage", () => {
  const mockPlayers = [
    { id: 1, username: "Player1" },
    { id: 2, username: "Player2" },
  ];

  it("should render lobby page with PIN", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText(/GAME LOBBY/i)).toBeInTheDocument();
    expect(
      screen.getByRole("text", { name: /Enter PIN:? 123456/i })
    ).toBeInTheDocument();
  });

  it("should display number of connected players", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    const playerCountElements = screen.getAllByText(/Connected Players/i);
    expect(playerCountElements.length).toBeGreaterThan(0);
  });

  it("should display player list", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should show start button only for admin", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: true,
      hostUserId: null,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(
      screen.getByRole("button", { name: /START GAME/i })
    ).toBeInTheDocument();
  });

  it("should not show start button for non-admin", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(
      screen.queryByRole("button", { name: /START GAME/i })
    ).not.toBeInTheDocument();
  });

  it("should exclude admin host from player list", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: true,
      hostUserId: 1,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.queryByText("Player1")).not.toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should exclude admin host using username when id is unavailable", () => {
    const playersMissingId = [
      { id: undefined as unknown as number, username: "HostUser" },
      { id: 2 as unknown as number, username: "GuestPlayer" },
    ];

    render(
      <LobbyPage
        gamePin="654321"
        players={playersMissingId}
        isAdmin
        hostUserId={null}
        hostUsername="HostUser"
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    expect(screen.queryByText("HostUser")).not.toBeInTheDocument();
    expect(screen.getByText("GuestPlayer")).toBeInTheDocument();
  });

  it("should exclude admin host when player id uses username value", () => {
    const playersWithNamedId = [
      { id: "admin" as unknown as number, username: "admin" },
      { id: "player-1" as unknown as number, username: "PlayerOne" },
    ];

    render(
      <LobbyPage
        gamePin="222333"
        players={playersWithNamedId}
        isAdmin
        hostUserId={1}
        hostUsername="Admin"
        onStartGame={vi.fn()}
        questionCount={3}
      />
    );

    expect(screen.queryByText("admin")).not.toBeInTheDocument();
    expect(screen.getByText("PlayerOne")).toBeInTheDocument();
  });

  it("should call onStartGame when admin clicks start button", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByRole("button", { name: /START GAME/i });
    fireEvent.click(startButton);

    expect(mockHandlers.onStartGame).toHaveBeenCalled();
  });

  it("should disable start button when quiz has no questions", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn(),
      questionCount: 0,
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByRole("button", { name: /START GAME/i });
    expect(startButton).toBeDisabled();
  });

  it("should show copy PIN button", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(
      screen.getByRole("button", { name: /Copy game PIN to clipboard/i })
    ).toBeInTheDocument();
  });

  it("should show join instructions", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText(/Join this game/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ask players to grab their phones and join in seconds/i)
    ).toBeInTheDocument();
  });

  it("should display QR code for joining", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    // Check for QR code section heading
    expect(screen.getByText(/Scan the QR code/i)).toBeInTheDocument();

    // Check for QR code image with proper aria-label
    const qrCode = screen.getByRole("img", {
      name: /QR code to join game with PIN 123456/i,
    });
    expect(qrCode).toBeInTheDocument();
  });

  it("should show host mode badge only for admin", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText(/HOST MODE/i)).toBeInTheDocument();
  });

  it("should not show host mode badge for non-admin", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.queryByText(/HOST MODE/i)).not.toBeInTheDocument();
  });
});
