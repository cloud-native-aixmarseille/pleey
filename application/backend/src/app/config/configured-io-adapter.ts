import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { Request } from 'express';
import { UnauthorizedError } from '../../domain/identity/errors';
import { BetterAuthSessionAdapter } from '../../infrastructure/identity/better-auth-session.adapter';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

type IoServer = ReturnType<IoAdapter['createIOServer']>;
type IoServerOptions = Parameters<IoAdapter['createIOServer']>[1];
type ResolvedIoServerOptions = NonNullable<IoServerOptions>;
type PartialIoServerOptions = Partial<ResolvedIoServerOptions>;
type IoServerMiddleware = Parameters<IoServer['use']>[0];
type IoSocket = Parameters<IoServerMiddleware>[0];
type IoNext = Parameters<IoServerMiddleware>[1];

export class ConfiguredIoAdapter extends IoAdapter {
  private readonly sessions: BetterAuthSessionAdapter;

  constructor(
    app: INestApplicationContext,
    private readonly corsOptions: GameSocketCorsOptions,
  ) {
    super(app);
    this.sessions = app.get(BetterAuthSessionAdapter);
  }

  override createIOServer(port: number, options?: IoServerOptions): IoServer {
    const serverOptions: PartialIoServerOptions = {
      ...(options ?? {}),
      path: options?.path ?? '/socket.io',
      // Recovery must reauthorize before sending a fresh snapshot. Socket.IO packet replay
      // can otherwise deliver private updates buffered before a participant was removed.
      cors: this.createCorsOptions(),
    };

    const server = super.createIOServer(port, serverOptions as IoServerOptions);

    server.use((socket: IoSocket, next: IoNext) => {
      void this.authenticateSocketConnection(socket, next);
    });

    return server;
  }

  private async authenticateSocketConnection(socket: IoSocket, next: IoNext): Promise<void> {
    try {
      if (socket.handshake.headers.authorization !== undefined || socket.handshake.auth?.authorization !== undefined) {
        next(new UnauthorizedError({ reason: 'legacySocketAuthorizationRejected' }));
        return;
      }
      const identity = await this.sessions.getSession(socket.request as Request);
      if (identity.kind !== 'valid') {
        delete socket.data.authenticatedUserId;
        delete socket.data.authenticatedSessionId;
        delete socket.data.authenticatedSessionExpiresAt;
        next();
        return;
      }

      socket.data.authenticatedUserId = identity.userId;
      socket.data.authenticatedSessionId = identity.sessionId;
      socket.data.authenticatedSessionExpiresAt = identity.expiresAt;
      socket.use(async (_packet, nextPacket) => {
        try {
          const revoked = await this.sessions.isSessionRevoked(identity.sessionId, identity.expiresAt);
          if (revoked) throw new UnauthorizedError({ reason: 'socketPacketSessionRevoked' });
          nextPacket();
        } catch {
          delete socket.data.authenticatedUserId;
          delete socket.data.authenticatedSessionId;
          delete socket.data.authenticatedSessionExpiresAt;
          nextPacket(new UnauthorizedError({ reason: 'socketPacketSessionRevoked' }));
          socket.disconnect(true);
        }
      });

      const checkSession = setInterval(() => {
        void this.sessions
          .isSessionRevoked(identity.sessionId, identity.expiresAt)
          .then((revoked) => {
            if (!revoked) return;
            delete socket.data.authenticatedUserId;
            delete socket.data.authenticatedSessionId;
            delete socket.data.authenticatedSessionExpiresAt;
            socket.disconnect(true);
          })
          .catch(() => {
            delete socket.data.authenticatedUserId;
            delete socket.data.authenticatedSessionId;
            delete socket.data.authenticatedSessionExpiresAt;
            socket.disconnect(true);
          });
      }, 15_000);

      checkSession.unref();
      socket.once('disconnect', () => clearInterval(checkSession));
      next();
    } catch (error) {
      next(error instanceof Error ? error : new UnauthorizedError({ reason: 'socketAuthenticationFailed' }));
    }
  }

  private createCorsOptions(): NonNullable<ResolvedIoServerOptions['cors']> {
    return {
      ...this.corsOptions,
      origin: this.corsOptions.origin === '*' ? '*' : [...this.corsOptions.origin],
    };
  }
}
