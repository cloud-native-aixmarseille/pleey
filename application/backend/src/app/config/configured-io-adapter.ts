import type { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions, Socket } from 'socket.io';
import { AUTH_JWT_SECRET } from '../../infrastructure/auth/auth-jwt-secret.token';
import type { GameSocketCorsOptions } from '../../presentation/game-session/live/shared/realtime/game-socket-cors-options.token';

interface SocketAuthenticatedUser {
  readonly id: number;
  readonly username: string;
}

export class ConfiguredIoAdapter extends IoAdapter {
  private readonly jwtService = new JwtService();
  private readonly jwtSecret: string;

  constructor(
    app: INestApplicationContext,
    private readonly corsOptions: GameSocketCorsOptions,
  ) {
    super(app);
    this.jwtSecret = app.get<string>(AUTH_JWT_SECRET);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: this.corsOptions,
    });

    server.use((socket: Socket, next: (error?: Error) => void) => {
      try {
        const token = this.extractBearerToken(socket);

        if (!token) {
          next();
          return;
        }

        const payload = this.jwtService.verify<SocketAuthenticatedUser>(token, {
          secret: this.jwtSecret,
        });

        socket.data.user = {
          id: payload.id,
          username: payload.username,
        } satisfies SocketAuthenticatedUser;
        next();
      } catch (error) {
        next(error instanceof Error ? error : new Error('Unauthorized'));
      }
    });

    return server;
  }

  private extractBearerToken(socket: Socket): string | null {
    const authToken = this.parseAuthorizationValue(socket.handshake.auth?.authorization);

    if (authToken) {
      return authToken;
    }

    return this.parseAuthorizationValue(socket.handshake.headers.authorization);
  }

  private parseAuthorizationValue(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const [scheme, token] = value.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
