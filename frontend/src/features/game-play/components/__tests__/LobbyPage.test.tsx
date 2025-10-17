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

    expect(screen.getByText(/Code PIN du jeu/i)).toBeInTheDocument();
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

    const playerCountElements = screen.getAllByText(/joueurs connectés/i);
    expect(playerCountElements.length).toBeGreaterThan(0);
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

    expect(screen.getByRole('button', { name: /Démarrer la partie/i })).toBeInTheDocument();
  });

  it('should not show start button for non-admin', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: false,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.queryByRole('button', { name: /Démarrer la partie/i })).not.toBeInTheDocument();
  });

  it('should call onStartGame when admin clicks start button', () => {
    const mockHandlers = {
      gamePin: '123456',
      players: mockPlayers,
      isAdmin: true,
      onStartGame: vi.fn()
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByRole('button', { name: /Démarrer la partie/i });
    fireEvent.click(startButton);

    expect(mockHandlers.onStartGame).toHaveBeenCalled();
  });
});
