import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions, Socket } from 'socket.io';
import { UnauthorizedError } from '../../domain/identity/errors';
import { JwtSessionAuthenticator } from '../../infrastructure/identity/services/jwt-session-authenticator';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

export class ConfiguredIoAdapter extends IoAdapter {
  private readonly sessions: JwtSessionAuthenticator;

  constructor(
    app: INestApplicationContext,
    private readonly corsOptions: GameSocketCorsOptions,
    private readonly partySessionRecoveryWindowMs: number,
  ) {
    super(app);
    this.sessions = app.get(JwtSessionAuthenticator);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const serverOptions = {
      ...(options ?? {}),
      path: options?.path ?? '/socket.io',
      connectionStateRecovery: {
        maxDisconnectionDuration: this.partySessionRecoveryWindowMs,
        skipMiddlewares: false,
      },
      cors: this.createCorsOptions(),
    } as ServerOptions;

    const server = super.createIOServer(port, serverOptions);

    server.use(async (socket: Socket, next: (error?: Error) => void) => {
      try {
        const token = this.extractBearerToken(socket);

        if (!token) {
          next();
          return;
        }

        const payload = await this.sessions.authenticate(token);
        socket.data.authenticatedUserId = payload.id;
        socket.use(async (_packet, nextPacket) => {
          try {
            await this.sessions.authenticate(token);
            nextPacket();
          } catch {
            nextPacket(new UnauthorizedError({ reason: 'socketPacketSessionRevoked' }));
            socket.disconnect(true);
          }
        });
        const checkSession = setInterval(() => {
          void this.sessions.authenticate(token, false).catch(() => socket.disconnect(true));
        }, 15_000);
        checkSession.unref();
        socket.once('disconnect', () => clearInterval(checkSession));
        next();
      } catch (error) {
        next(error instanceof Error ? error : new UnauthorizedError({ reason: 'socketAuthenticationFailed' }));
      }
    });

    return server;
  }

  private createCorsOptions(): NonNullable<ServerOptions['cors']> {
    return {
      ...this.corsOptions,
      origin: this.corsOptions.origin === '*' ? '*' : [...this.corsOptions.origin],
    };
  }

  private extractBearerToken(socket: Socket): string | null {
    const authToken = this.parseAuthorizationValue(socket.handshake.auth?.authorization);

    if (authToken) {
      return authToken;
    }

    return this.parseAuthorizationValue(socket.handshake.headers.authorization);
  }

  private parseAuthorizationValue(value: unknown): string | null {
    if (value === undefined) return null;
    if (typeof value !== 'string') throw new UnauthorizedError({ reason: 'invalidSocketAuthorizationType' });

    const [scheme, token, extra] = value.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra !== undefined) {
      throw new UnauthorizedError({ reason: 'invalidSocketAuthorizationFormat' });
    }

    return token;
  }
}
