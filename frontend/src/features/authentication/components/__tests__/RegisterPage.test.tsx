import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  it('should render registration form', () => {
    const mockRegister = vi.fn();
    const mockNavigate = vi.fn();
    render(<RegisterPage onRegister={mockRegister} onNavigate={mockNavigate} />);

    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument();
  });

  it('should call onRegister with user data when form is submitted', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    const mockNavigate = vi.fn();
    
    render(<RegisterPage onRegister={mockRegister} onNavigate={mockNavigate} />);

    const usernameInput = screen.getByPlaceholderText("Nom d'utilisateur");
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const submitButton = screen.getByRole('button', { name: "S'inscrire" });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
    });
  });
});
