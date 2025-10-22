import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizApp from "../App";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

// Mock fetch
global.fetch = vi.fn();

describe("QuizApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockReset();
    window.localStorage.clear();
  });

  it("should render the home view by default", () => {
    render(<QuizApp />);
    expect(screen.getByText(/QuizMaster/i)).toBeInTheDocument();
  });

  it("should have login and register buttons on home page", () => {
    render(<QuizApp />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("should switch to login view when login button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuizApp />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });
  });

  it("should switch to register view when register button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuizApp />);

    const registerButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it("should handle successful login", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "fake-token",
        user: { id: 1, username: "testuser", isAdmin: false },
      }),
    });

    render(<QuizApp />);

    // Navigate to login
    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /se connecter/i });
    await user.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        })
      );
    });
  });

  it("should handle registration", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    // Mock window.alert
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<QuizApp />);

    // Navigate to register
    const registerButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(registerButton);

    // Fill in registration form
    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    await user.type(usernameInput, "newuser");
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "newpassword");

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /créer mon compte/i,
    });
    await user.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/register"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    alertMock.mockRestore();
  });
});
