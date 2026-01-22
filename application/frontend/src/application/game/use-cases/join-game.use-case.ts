import { GameSocket } from "../../../domains/game/ports/game-socket";

export interface JoinGameRequest {
  pin: string;
  username: string;
  userId?: number; // Optional for guest players
  guestId?: string; // For guest players
}

/**
 * Join Game Use Case
 * Handles player joining a game session
 * Following Clean Architecture and Single Responsibility Principle
 */
export class JoinGameUseCase {
  constructor(private readonly gameSocket: GameSocket) { }

  execute(request: JoinGameRequest): void {
    const { pin, username, userId, guestId } = request;

    // Business rule: validate PIN
    if (!pin || pin.trim().length === 0) {
      throw new Error("Game PIN is required");
    }

    this.gameSocket.publish({
      type: "join-game",
      pin,
      username,
      userId,
      guestId,
    });
  }
}
