import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../HomePage";

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

    expect(screen.getByText(/LOGIN/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
  });

  it('should call onNavigate with "login" when login button is clicked', () => {
    render(<HomePage />);

    const loginButton = screen.getByText(/LOGIN/i);
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });

  it('should call onNavigate with "register" when register button is clicked', () => {
    render(<HomePage />);

    const registerButton = screen.getByText(/SIGN UP/i);
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/register");
  });
});
