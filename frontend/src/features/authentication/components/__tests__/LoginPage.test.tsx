import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';

describe('LoginPage', () => {
  it('should render login form', () => {
    const mockLogin = vi.fn();
    const mockNavigate = vi.fn();
    render(<LoginPage onLogin={mockLogin} onNavigate={mockNavigate} />);

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('should call onLogin with email and password when form is submitted', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const mockNavigate = vi.fn();
    
    render(<LoginPage onLogin={mockLogin} onNavigate={mockNavigate} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Se connecter' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should navigate back to home when back button is clicked', () => {
    const mockLogin = vi.fn();
    const mockNavigate = vi.fn();
    render(<LoginPage onLogin={mockLogin} onNavigate={mockNavigate} />);

    const backButton = screen.getByText('← Retour');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('home');
  });
});
