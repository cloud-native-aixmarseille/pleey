import type { ServerOptions } from 'socket.io';

export type GameSocketCorsOptions = NonNullable<ServerOptions['cors']>;

export const GAME_SOCKET_CORS_OPTIONS = Symbol('GAME_SOCKET_CORS_OPTIONS');
