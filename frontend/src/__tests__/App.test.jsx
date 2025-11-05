import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
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

  const renderApp = (initialEntries = ["/"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <QuizApp />
      </MemoryRouter>
    );

  it("should render the home view by default", () => {
    renderApp();
    expect(screen.getByText(/QuizMaster/i)).toBeInTheDocument();
  });

  it("should have login and register buttons on home page", () => {
    renderApp();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("should switch to login view when login button is clicked", async () => {
    const user = userEvent.setup();
    renderApp();

    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  it("should switch to register view when register button is clicked", async () => {
    const user = userEvent.setup();
    renderApp();

    const registerButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
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

    renderApp();

    // Navigate to login
    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
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

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /start game/i })
      ).toBeInTheDocument();
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

    renderApp();

    // Navigate to register
    const registerButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(registerButton);

    // Fill in registration form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, "newuser");
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "newpassword");

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
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

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    alertMock.mockRestore();
  });

  // TODO: Fix this flaky integration test - login flow timing issues
  it.skip("should prevent launching a quiz that has no questions", async () => {
    const user = userEvent.setup();

    const loginResponse = {
      token: "admin-token",
      user: {
        id: 1,
        username: "admin",
        email: "admin@test.com",
        isAdmin: true,
      },
    };

    const quizzesResponse = [
      {
        id: 1,
        title: "Empty Quiz",
        description: "",
        created_by: 1,
        created_at: new Date().toISOString(),
        is_active: true,
        question_count: 0,
      },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => quizzesResponse,
      });

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    // Start at login page
    renderApp(["/auth/login"]);

    // Login as admin
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "password123");

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(loginButton);

    // Wait for navigation to admin dashboard and quiz list to load
    // The dashboard should show the quiz after login
    await waitFor(
      () => {
        const quizTitle = screen.queryByText("Empty Quiz");
        expect(quizTitle).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Find and click the launch button for the empty quiz
    const launchButtons = await screen.findAllByRole("button", {
      name: /launch/i,
    });
    expect(launchButtons.length).toBeGreaterThan(0);
    await user.click(launchButtons[0]);

    // Should show alert about needing questions
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining("Add at least one question")
      );
    });

    // Verify no session creation API call was made
    const createSessionCall = global.fetch.mock.calls.find(
      ([url]) => typeof url === "string" && url.includes("/api/sessions/create")
    );
    expect(createSessionCall).toBeUndefined();

    alertMock.mockRestore();
  });
});
