import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../LoginPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("should render login form", () => {
    const mockLogin = vi.fn();
    render(<LoginPage onLogin={mockLogin} />);

    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /se connecter/i })
    ).toBeInTheDocument();
  });

  it("should call onLogin with email and password when form is submitted", async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    render(<LoginPage onLogin={mockLogin} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", { name: /se connecter/i });

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
      .mockRejectedValue(new Error("Identifiants invalides"));

    render(<LoginPage onLogin={mockLogin} />);

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "badpass");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants invalides"
    );
  });

  it("should navigate back to home when back button is clicked", () => {
    const mockLogin = vi.fn();
    render(<LoginPage onLogin={mockLogin} />);

    const backButton = screen.getByText("Retour");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
