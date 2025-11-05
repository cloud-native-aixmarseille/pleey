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
    expect(screen.getByText("123456")).toBeInTheDocument();
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

    expect(screen.getByText(/HOW TO JOIN THIS GAME/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Or scan this QR code/i)).toBeInTheDocument();

    // Check for QR code image with proper aria-label
    const qrCode = screen.getByRole("img", { name: /QR code to join game with PIN 123456/i });
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
