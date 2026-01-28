import { inject, injectable } from 'inversify';
import { LobbyService } from '../../../../../domains/game-session/services/lobby-service';

export type {
  GameLobbyState,
  GetGameLobbyStateCommand,
} from '../../shared/contracts/lobby-state';

import {
  GameLobbyRedirectTarget,
  type GameLobbyState,
  GameLobbyStatus,
  type GetGameLobbyStateCommand,
} from '../../shared/contracts/lobby-state';

@injectable()
export class GetGameLobbyStateUseCase {
  constructor(@inject(LobbyService) private readonly lobbyService: LobbyService) {}

  execute(command: GetGameLobbyStateCommand): GameLobbyState {
    const players = this.resolvePlayers(command);
    const highlightedPlayers = this.lobbyService.selectHighlightedPlayers(
      players,
      command.userId,
      null,
      command.isAuthenticated ? command.username : command.guestNickname,
    );

    const pinCharacters = this.lobbyService.buildPinCharacters(command.activePin);

    const status = this.resolveStatus(command);
    const redirectTarget = this.resolveRedirectTarget(command, status);
    const unknownErrorMessageKey =
      status === GameLobbyStatus.READY &&
      this.lobbyService.shouldShowUnknownLobbyError(command.errorCode)
        ? 'game.join.errors.UNKNOWN'
        : null;

    return {
      highlightedPlayers,
      pinCharacters,
      playerCount:
        highlightedPlayers.otherPlayers.length + (highlightedPlayers.currentPlayer ? 1 : 0),
      status,
      redirectTarget,
      unknownErrorMessageKey,
    };
  }

  private resolvePlayers(command: GetGameLobbyStateCommand) {
    if (command.hasReceivedRoster || command.players.length > 0) {
      return command.players;
    }

    const pendingCurrentPlayer = this.buildPendingCurrentPlayer(command);

    return pendingCurrentPlayer ? [pendingCurrentPlayer] : command.players;
  }

  private buildPendingCurrentPlayer(command: GetGameLobbyStateCommand) {
    if (!command.hasIdentity || !command.lastJoinRequest) {
      return null;
    }

    const normalizedActivePin = command.activePin.trim().toUpperCase();
    const normalizedReceiptPin = command.lastJoinRequest.pin.trim().toUpperCase();

    if (!normalizedActivePin || normalizedActivePin !== normalizedReceiptPin) {
      return null;
    }

    if (command.isAuthenticated) {
      if (
        'guestId' in command.lastJoinRequest ||
        !command.userId ||
        !command.username ||
        command.lastJoinRequest.username !== command.username
      ) {
        return null;
      }

      return {
        id: command.userId,
        username: command.username,
        avatarUri: command.authenticatedAvatarUri,
      };
    }

    const guestNickname = command.guestNickname.trim();

    if (
      !('guestId' in command.lastJoinRequest) ||
      !guestNickname ||
      command.lastJoinRequest.username !== guestNickname
    ) {
      return null;
    }

    return {
      guestId: command.lastJoinRequest.guestId,
      username: guestNickname,
      avatarUri: command.lastJoinRequest.avatarUri ?? null,
    };
  }

  private resolveStatus(command: GetGameLobbyStateCommand): GameLobbyState['status'] {
    if (!command.activePin.trim()) {
      return GameLobbyStatus.REDIRECT;
    }

    if (!command.hasRestoredSession) {
      return GameLobbyStatus.LOADING;
    }

    if (!command.hasIdentity) {
      return GameLobbyStatus.REDIRECT;
    }

    if (command.hasGameStarted) {
      return GameLobbyStatus.REDIRECT;
    }

    if (this.lobbyService.shouldLeaveLobby(command.errorCode)) {
      return GameLobbyStatus.REDIRECT;
    }

    return GameLobbyStatus.READY;
  }

  private resolveRedirectTarget(
    command: GetGameLobbyStateCommand,
    status: GameLobbyState['status'],
  ): GameLobbyState['redirectTarget'] {
    if (status !== GameLobbyStatus.REDIRECT) {
      return null;
    }

    if (command.hasGameStarted && command.hasIdentity) {
      return GameLobbyRedirectTarget.PLAYING;
    }

    return GameLobbyRedirectTarget.JOIN;
  }
}
