export interface GameSocketCorsOptions {
  readonly origin: '*' | readonly string[];
  readonly credentials: boolean;
}

export const GAME_SOCKET_CORS_OPTIONS = Symbol('GAME_SOCKET_CORS_OPTIONS');
