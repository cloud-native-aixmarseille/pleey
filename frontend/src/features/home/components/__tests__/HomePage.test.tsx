import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage';

describe('HomePage', () => {
  it('should render the home page with title', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    expect(screen.getByText(/QUIZMASTER/i)).toBeInTheDocument();
  });

  it('should render login and register buttons', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    expect(screen.getByText(/LOGIN/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
  });

  it('should call onNavigate with "login" when login button is clicked', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    const loginButton = screen.getByText(/LOGIN/i);
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  it('should call onNavigate with "register" when register button is clicked', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    const registerButton = screen.getByText(/SIGN UP/i);
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('register');
  });
});
