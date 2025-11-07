import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../LoginPage";
import { NotificationProvider } from "../../../../application/app/context/NotificationContext";

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

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  const renderLoginPage = (
    onLogin: (email: string, password: string) => Promise<void>
  ) => {
    return render(
      <NotificationProvider>
        <LoginPage onLogin={onLogin} />
      </NotificationProvider>
    );
  };

  it("should render login form", () => {
    const mockLogin = vi.fn();
    renderLoginPage(mockLogin);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("should call onLogin with email and password when form is submitted", async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    renderLoginPage(mockLogin);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("should display an error message when login fails", async () => {
    const user = userEvent.setup();
    const mockLogin = vi
      .fn()
      .mockRejectedValue(new Error("Invalid credentials"));

    renderLoginPage(mockLogin);

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "badpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should navigate back to home when back button is clicked", () => {
    const mockLogin = vi.fn();
    renderLoginPage(mockLogin);

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
