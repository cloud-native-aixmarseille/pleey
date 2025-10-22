import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../RegisterPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render registration form", () => {
    const mockRegister = vi.fn();
    render(<RegisterPage onRegister={mockRegister} />);

    expect(screen.getByText("Inscription")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /créer un compte/i })
    ).toBeInTheDocument();
  });

  it("should call onRegister with user data when form is submitted", async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue(undefined);

    render(<RegisterPage onRegister={mockRegister} />);

    const usernameInput = screen.getByLabelText("Nom d'utilisateur");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", {
      name: /créer un compte/i,
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

  it("should navigate to login when the button is clicked", () => {
    const mockRegister = vi.fn();
    render(<RegisterPage onRegister={mockRegister} />);

    const loginButton = screen.getByRole("button", { name: /se connecter/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });
});
