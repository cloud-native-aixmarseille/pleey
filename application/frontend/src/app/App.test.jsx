import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import QuizApp from "./App";
import { authService } from "../domains/auth/auth.service";
import { organizationService } from "../domains/organization/organization.service";
import { createAuthResponsePayloadFixture } from "../test/fixtures";
import {
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../domains/shared/constants/storageKeys";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe("QuizApp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.localStorage?.clear();
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
      expect(
        screen.getByLabelText(/email/i, { selector: "input" })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/password/i, { selector: "input" })
      ).toBeInTheDocument();
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
    const loginSpy = vi.spyOn(authService, "login").mockResolvedValue(
      createAuthResponsePayloadFixture({
        token: "fake-token",
        accessToken: "fake-token",
        refreshToken: "fake-refresh-token",
      })
    );
    vi.spyOn(organizationService, "getMyOrganizations").mockResolvedValue([]);

    renderApp();

    // Navigate to login
    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i, { selector: "input" });
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: "input",
    });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith("test@example.com", "password123");
    });

    await waitFor(() => {
      expect(globalThis.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(
        "fake-token"
      );
      expect(globalThis.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe(
        "fake-refresh-token"
      );
      expect(globalThis.localStorage.getItem(USER_STORAGE_KEY)).toContain(
        "testuser"
      );
    });
  });

  it("should handle registration", async () => {
    const user = userEvent.setup();
    const registerSpy = vi.spyOn(authService, "register").mockResolvedValue();
    vi.spyOn(organizationService, "getMyOrganizations").mockResolvedValue([]);

    renderApp();

    // Navigate to register
    const registerButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(registerButton);

    // Fill in registration form
    const usernameInput = screen.getByLabelText(/username/i, {
      selector: "input",
    });
    const emailInput = screen.getByLabelText(/email/i, { selector: "input" });
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: "input",
    });

    await user.type(usernameInput, "newuser");
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "newpassword");

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith(
        "newuser",
        "new@example.com",
        "newpassword"
      );
    });

    // Registration redirects to login; wait for the login view to be rendered.
    await screen.findByRole("button", { name: /sign in/i }, { timeout: 5000 });

    expect(
      screen.getByLabelText(/email/i, { selector: "input" })
    ).toBeInTheDocument();
  });
});
