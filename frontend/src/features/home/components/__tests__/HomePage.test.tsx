import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage';

describe('HomePage', () => {
  it('should render the home page with title', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    expect(screen.getByText(/QuizMaster/i)).toBeInTheDocument();
    expect(screen.getByText(/Apprenez en vous amusant/i)).toBeInTheDocument();
  });

  it('should render login and register buttons', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });

  it('should call onNavigate with "login" when login button is clicked', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    const loginButton = screen.getByText('Se connecter');
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  it('should call onNavigate with "register" when register button is clicked', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    const registerButton = screen.getByText("S'inscrire");
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('register');
  });
});
