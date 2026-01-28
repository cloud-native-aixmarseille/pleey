import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LobbyStatusBar } from './lobby-status-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

const defaultProps = {
  errorMessage: null,
  gameTypeTitleKey: null,
  gameTitle: null,
  isHost: false,
  onStartGame: vi.fn(),
  onLeaveSession: vi.fn(),
};

describe('LobbyStatusBar', () => {
  it('renders the status title and waiting message for players', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} />);

    const bar = screen.getByRole('banner', { name: 'game.lobby.sessionBarLabel' });

    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent('game.lobby.statusTitle');
    expect(bar).toHaveTextContent('game.lobby.waitingForHost');
  });

  it('renders the game title when session metadata is available', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} gameTitle="Arcade Trivia" />);

    expect(screen.getByRole('heading', { name: 'Arcade Trivia' })).toBeInTheDocument();
  });

  it('renders the translated game type badge when metadata is available', () => {
    renderWithUiProvider(
      <LobbyStatusBar {...defaultProps} gameTypeTitleKey="quiz.gameType.title" />,
    );

    expect(screen.getByText('quiz.gameType.title')).toBeInTheDocument();
  });

  it('renders an error message when provided', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} errorMessage="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render an error badge when there is no error', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} />);

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('renders a start game button for the host', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} isHost />);

    expect(screen.getByRole('button', { name: 'game.lobby.startGameCta' })).toBeInTheDocument();
    expect(screen.queryByText('game.lobby.waitingForHost')).not.toBeInTheDocument();
  });

  it('calls onStartGame when the host clicks the start button', async () => {
    const onStartGame = vi.fn();
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} isHost onStartGame={onStartGame} />);

    await userEvent.click(screen.getByRole('button', { name: 'game.lobby.startGameCta' }));

    expect(onStartGame).toHaveBeenCalledOnce();
  });

  it('renders a leave button for players', () => {
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'game.lobby.leaveCta' })).toBeInTheDocument();
  });

  it('calls onLeaveSession when the player clicks the leave button', async () => {
    const onLeaveSession = vi.fn();
    renderWithUiProvider(<LobbyStatusBar {...defaultProps} onLeaveSession={onLeaveSession} />);

    await userEvent.click(screen.getByRole('button', { name: 'game.lobby.leaveCta' }));

    expect(onLeaveSession).toHaveBeenCalledOnce();
  });
});
