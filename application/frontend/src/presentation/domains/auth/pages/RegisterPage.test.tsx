import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./RegisterPage";
import {
  ColorSchemeProvider,
  ThemeProvider,
} from "../../../../presentation/shared/ui/theme";

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

describe("RegisterPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render registration form", () => {
    const mockRegister = vi.fn();
    render(
      <ColorSchemeProvider>
        <ThemeProvider>
          <RegisterPage onRegister={mockRegister} />
        </ThemeProvider>
      </ColorSchemeProvider>
    );

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("should call onRegister with user data when form is submitted", async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue(undefined);

    render(
      <ColorSchemeProvider>
        <ThemeProvider>
          <RegisterPage onRegister={mockRegister} />
        </ThemeProvider>
      </ColorSchemeProvider>
    );

    const usernameInput = screen.getByLabelText("Username");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(usernameInput, "newuser");
    await user.type(emailInput, "new@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "newuser",
        "new@example.com",
        "password123"
      );
    });
  });

  it("should allow toggling password visibility", async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn();

    render(
      <ColorSchemeProvider>
        <ThemeProvider>
          <RegisterPage onRegister={mockRegister} />
        </ThemeProvider>
      </ColorSchemeProvider>
    );

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    expect(passwordInput.type).toBe("password");

    const showButton = screen.getByRole("button", {
      name: /show password/i,
    });

    await user.click(showButton);
    expect(passwordInput.type).toBe("text");

    const hideButton = screen.getByRole("button", {
      name: /hide password/i,
    });

    await user.click(hideButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should navigate to login when the button is clicked", () => {
    const mockRegister = vi.fn();
    render(
      <ColorSchemeProvider>
        <ThemeProvider>
          <RegisterPage onRegister={mockRegister} />
        </ThemeProvider>
      </ColorSchemeProvider>
    );

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });
});
