import { describe, expect, it } from 'vitest';
import type { GameSessionPlayer } from '../../../../../domains/game-session/entities/game-session-player';
import { GameLobbyErrorCode } from '../../../../../domains/game-session/errors/game-lobby-error-code';
import { LobbyService } from '../../../../../domains/game-session/services/lobby-service';
import { GameLobbyRedirectTarget, GameLobbyStatus } from '../../shared/contracts/lobby-state';
import { GetGameLobbyStateUseCase } from './get-game-lobby-state-use-case';

describe('GetGameLobbyStateUseCase', () => {
  const useCase = new GetGameLobbyStateUseCase(new LobbyService());

  const players: GameSessionPlayer[] = [
    { id: 1, guestId: null, username: 'Alice', avatarUri: '' },
    { id: null, guestId: 'g1', username: 'Bob', avatarUri: '' },
  ] as unknown as GameSessionPlayer[];

  it('builds pin characters from the active pin', () => {
    const result = useCase.execute({
      activePin: 'AB12',
      errorCode: null,
      guestNickname: '',
      hasGameStarted: false,
      hasReceivedRoster: false,
      hasIdentity: false,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players: [],
      userId: null,
      username: null,
    });

    expect(result.pinCharacters).toHaveLength(6);
    expect(result.pinCharacters[0]).toEqual({ value: 'A', isPlaceholder: false });
    expect(result.pinCharacters[4]).toEqual({ value: '•', isPlaceholder: true });
  });

  it('highlights the authenticated player', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: '',
      hasGameStarted: false,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: true,
      authenticatedAvatarUri: 'https://api.example.com/api/avatars/users/1?v=42',
      lastJoinRequest: null,
      players,
      userId: 1,
      username: 'Alice',
    });

    expect(result.highlightedPlayers.currentPlayer?.username).toBe('Alice');
    expect(result.highlightedPlayers.otherPlayers).toHaveLength(1);
  });

  it('highlights the guest player by nickname', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: 'Bob',
      hasGameStarted: false,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players,
      userId: null,
      username: null,
    });

    expect(result.highlightedPlayers.currentPlayer?.username).toBe('Bob');
    expect(result.highlightedPlayers.otherPlayers).toHaveLength(1);
  });

  it('returns loading while the auth session is being restored', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: 'Bob',
      hasGameStarted: false,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: false,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players,
      userId: null,
      username: null,
    });

    expect(result.status).toBe(GameLobbyStatus.LOADING);
    expect(result.redirectTarget).toBeNull();
  });

  it('redirects guests back to join when the lobby becomes unavailable', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: GameLobbyErrorCode.GAME_SESSION_ENDED,
      guestNickname: 'Bob',
      hasGameStarted: false,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players,
      userId: null,
      username: null,
    });

    expect(result.status).toBe(GameLobbyStatus.REDIRECT);
    expect(result.redirectTarget).toBe(GameLobbyRedirectTarget.JOIN);
  });

  it('redirects to live when the game has started', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: 'Bob',
      hasGameStarted: true,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players,
      userId: null,
      username: null,
    });

    expect(result.status).toBe(GameLobbyStatus.REDIRECT);
    expect(result.redirectTarget).toBe(GameLobbyRedirectTarget.PLAYING);
  });

  it('exposes a semantic unknown error message key for ready lobbies', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: GameLobbyErrorCode.UNKNOWN,
      guestNickname: 'Bob',
      hasGameStarted: false,
      hasReceivedRoster: true,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: null,
      players,
      userId: null,
      username: null,
    });

    expect(result.status).toBe(GameLobbyStatus.READY);
    expect(result.unknownErrorMessageKey).toBe('game.join.errors.UNKNOWN');
  });

  it('shows the just-joined guest while the first roster event is still pending', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: 'Switch',
      hasGameStarted: false,
      hasReceivedRoster: false,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: false,
      authenticatedAvatarUri: null,
      lastJoinRequest: {
        avatarUri: '/api/avatars/guests/guest-22',
        guestId: 'guest-22',
        pin: 'AB12CD',
        username: 'Switch',
      },
      players: [],
      userId: null,
      username: null,
    });

    expect(result.highlightedPlayers.currentPlayer).toMatchObject({ username: 'Switch' });
    expect(result.highlightedPlayers.currentPlayer).toMatchObject({ guestId: 'guest-22' });
    expect(result.highlightedPlayers.currentPlayer?.avatarUri).toBe('/api/avatars/guests/guest-22');
    expect(result.playerCount).toBe(1);
  });

  it('shows the just-joined authenticated player while the first roster event is still pending', () => {
    const result = useCase.execute({
      activePin: 'AB12CD',
      errorCode: null,
      guestNickname: '',
      hasGameStarted: false,
      hasReceivedRoster: false,
      hasIdentity: true,
      hasRestoredSession: true,
      isAuthenticated: true,
      authenticatedAvatarUri: 'https://api.example.com/api/avatars/users/1?v=42',
      lastJoinRequest: {
        pin: 'AB12CD',
        username: 'Alice',
      },
      players: [],
      userId: 1,
      username: 'Alice',
    });

    expect(result.highlightedPlayers.currentPlayer).toMatchObject({ id: 1, username: 'Alice' });
    expect(result.highlightedPlayers.currentPlayer?.avatarUri).toBe(
      'https://api.example.com/api/avatars/users/1?v=42',
    );
    expect(result.playerCount).toBe(1);
  });
});
