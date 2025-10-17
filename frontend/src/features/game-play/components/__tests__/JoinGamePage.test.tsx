import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinGamePage from '../JoinGamePage';

describe('JoinGamePage', () => {
  it('should render join game page', () => {
    const mockHandlers = {
      gamePin: '',
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onNavigate: vi.fn()
    };

    render(<JoinGamePage {...mockHandlers} />);

    expect(screen.getByText('Rejoindre une partie')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entrer le code PIN')).toBeInTheDocument();
  });

  it('should update game pin when user types', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      gamePin: '',
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onNavigate: vi.fn()
    };

    render(<JoinGamePage {...mockHandlers} />);

    const input = screen.getByPlaceholderText('Entrer le code PIN');
    await user.type(input, '123456');

    expect(mockHandlers.onGamePinChange).toHaveBeenCalled();
  });

  it('should disable join button when PIN is not 6 characters', () => {
    const mockHandlers = {
      gamePin: '123',
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onNavigate: vi.fn()
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByText('Rejoindre');
    expect(joinButton).toBeDisabled();
  });

  it('should enable join button when PIN is 6 characters', () => {
    const mockHandlers = {
      gamePin: '123456',
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onNavigate: vi.fn()
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByText('Rejoindre');
    expect(joinButton).not.toBeDisabled();
  });

  it('should call onJoinGame when join button is clicked', () => {
    const mockHandlers = {
      gamePin: '123456',
      onGamePinChange: vi.fn(),
      onJoinGame: vi.fn(),
      onNavigate: vi.fn()
    };

    render(<JoinGamePage {...mockHandlers} />);

    const joinButton = screen.getByText('Rejoindre');
    fireEvent.click(joinButton);

    expect(mockHandlers.onJoinGame).toHaveBeenCalled();
  });
});
