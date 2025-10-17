import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LobbyPage from '../LobbyPage';

describe('LobbyPage', () => {
  const mockPlayers = [
    { id: 1, username: 'Player1' },
    { id: 2, username: 'Player2' }
  ];

  it('should render lobby page with PIN', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText('Code PIN')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('should display number of connected players', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText('2 joueurs connectés')).toBeInTheDocument();
  });

  it('should display player list', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
  });

  it('should show start button only for admin', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText(/Démarrer la partie/i)).toBeInTheDocument();
  });

  it('should not show start button for non-admin', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.queryByText(/Démarrer la partie/i)).not.toBeInTheDocument();
  });

  it('should call onStartGame when admin clicks start button', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByText(/Démarrer la partie/i);
    fireEvent.click(startButton);

    expect(mockHandlers.onStartGame).toHaveBeenCalled();
  });
});
