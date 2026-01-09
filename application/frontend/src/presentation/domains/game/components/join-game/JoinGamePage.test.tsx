import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinGamePage from "./JoinGamePage";

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

describe("JoinGamePage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render join game page", () => {
    const mockHandlers = {
      gamePin: "",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    expect(screen.getByText(/JOIN GAME/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••")).toBeInTheDocument();
  });

  it("should update game pin when user types", async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      gamePin: "",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const input = screen.getByPlaceholderText("••••••");
    await user.type(input, "123456");

    expect(mockHandlers.onGamePinChange).toHaveBeenCalled();
  });

  it("should disable join button when PIN is not 6 characters", () => {
    const mockHandlers = {
      gamePin: "123",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /CONTINUE/i });
    expect(joinButton).toBeDisabled();
  });

  it("should enable continue button when PIN is 6 characters", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /CONTINUE/i });
    expect(joinButton).not.toBeDisabled();
  });

  it("should show guest nickname form when continue is clicked while unauthenticated", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
    fireEvent.click(continueButton);

    expect(screen.getByPlaceholderText(/Enter nickname/i)).toBeInTheDocument();
    expect(mockHandlers.onJoinGame).not.toHaveBeenCalled();
  });

  it("should show guest nickname form when Enter key is pressed with valid PIN while unauthenticated", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const input = screen.getByPlaceholderText("••••••");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByPlaceholderText(/Enter nickname/i)).toBeInTheDocument();
    expect(mockHandlers.onJoinGame).not.toHaveBeenCalled();
  });

  it("should call onJoinGame when authenticated and PIN is complete", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: true,
      username: "alice",
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /CONFIRM & JOIN/i });
    fireEvent.click(joinButton);

    expect(mockHandlers.onJoinGame).toHaveBeenCalledTimes(1);
  });

  it("should call onJoinAsGuest with trimmed nickname", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
    fireEvent.click(continueButton);

    const nicknameInput = screen.getByPlaceholderText(/Enter nickname/i);
    fireEvent.change(nicknameInput, { target: { value: "  bob  " } });

    const joinAsGuestButton = screen.getByRole("button", {
      name: /JOIN AS GUEST/i,
    });
    fireEvent.click(joinAsGuestButton);

    expect(mockHandlers.onJoinAsGuest).toHaveBeenCalledWith("bob");
  });

  it("should navigate back to home when back button is clicked", () => {
    const mockHandlers = {
      gamePin: "",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onJoinAsGuest: vi.fn(),
      isAuthenticated: false,
      username: undefined,
    };

    render(<JoinGamePage {...mockHandlers} />);

    const backButton = screen.getByText(/back to menu/i);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
