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
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
  });

  it('should call onRegister with user data when form is submitted', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    const mockNavigate = vi.fn();
    
    render(<RegisterPage onRegister={mockRegister} onNavigate={mockNavigate} />);

    const usernameInput = screen.getByLabelText("Nom d'utilisateur");
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
    });
  });
});
