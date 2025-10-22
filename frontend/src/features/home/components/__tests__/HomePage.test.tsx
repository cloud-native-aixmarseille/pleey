import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../HomePage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("HomePage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render the home page with title", () => {
    render(<HomePage />);

    expect(screen.getByText(/QUIZMASTER/i)).toBeInTheDocument();
  });

  it("should render login and register buttons", () => {
    render(<HomePage />);

    // Updated to French since test setup uses French
    expect(screen.getByText(/CONNEXION/i)).toBeInTheDocument();
    expect(screen.getByText(/INSCRIPTION/i)).toBeInTheDocument();
  });

  it('should call onNavigate with "login" when login button is clicked', () => {
    render(<HomePage />);

    const loginButton = screen.getByText(/CONNEXION/i);
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });

  it('should call onNavigate with "register" when register button is clicked', () => {
    render(<HomePage />);

    const registerButton = screen.getByText(/INSCRIPTION/i);
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/register");
  });
});
