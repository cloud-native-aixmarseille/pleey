import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinGamePage from "../JoinGamePage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("JoinGamePage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render join game page", () => {
    const mockHandlers = {
      gamePin: "",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
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
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /START GAME/i });
    expect(joinButton).toBeDisabled();
  });

  it("should enable join button when PIN is 6 characters", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /START GAME/i });
    expect(joinButton).not.toBeDisabled();
  });

  it("should call onJoinGame when join button is clicked", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByRole("button", { name: /START GAME/i });
    fireEvent.click(joinButton);

    expect(mockHandlers.onJoinGame).toHaveBeenCalled();
  });

  it("should call onJoinGame when Enter key is pressed with valid PIN", () => {
    const mockHandlers = {
      gamePin: "123456",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
    };

    render(<JoinGamePage {...mockHandlers} />);

    const input = screen.getByPlaceholderText("••••••");
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(mockHandlers.onJoinGame).toHaveBeenCalled();
  });

  it("should navigate back to home when back button is clicked", () => {
    const mockHandlers = {
      gamePin: "",
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
    };

    render(<JoinGamePage {...mockHandlers} />);

    const backButton = screen.getByText(/back to menu/i);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
