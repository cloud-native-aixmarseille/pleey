export const GAME_SERVICE_ID = {
  gameHostControlRuntime: Symbol.for('gameHostControlRuntime'),
  gameJoinRuntime: Symbol.for('gameJoinRuntime'),
  gameLobbyRuntime: Symbol.for('gameLobbyRuntime'),
  gamePlayingRuntime: Symbol.for('gamePlayingRuntime'),
  gameSessionRepository: Symbol.for('gameSessionRepository'),
  guestPlayerIdGenerator: Symbol.for('guestPlayerIdGenerator'),
} as const;
