import { Inject, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import type { Request } from 'express';
import type { PrismaService } from '../database/prisma-service';
import { BETTER_AUTH } from './better-auth.token';

export type SessionIdentity =
  | { kind: 'valid'; userId: string; sessionId: string; expiresAt: Date; isAnonymous: boolean }
  | { kind: 'absent' }
  | { kind: 'expired' }
  | { kind: 'revoked' }
  | { kind: 'unavailable' };

export type BetterAuthInstance = ReturnType<typeof import('./better-auth-config').createBetterAuth>;

@Injectable()
export class BetterAuthSessionAdapter {
  constructor(
    @Inject(BETTER_AUTH) private readonly auth: BetterAuthInstance,
    private readonly prisma: PrismaService,
  ) {}

  async getSession(request: Request): Promise<SessionIdentity> {
    try {
      const result = await this.auth.api.getSession({
        headers: fromNodeHeaders(request.headers as IncomingHttpHeaders),
      });
      if (!result?.session || !result.user) return { kind: 'absent' };
      const expiresAt = new Date(result.session.expiresAt);
      if (expiresAt <= new Date()) return { kind: 'expired' };
      return {
        kind: 'valid',
        userId: result.user.id,
        sessionId: result.session.id,
        expiresAt,
        isAnonymous: Boolean((result.user as { isAnonymous?: boolean }).isAnonymous),
      };
    } catch {
      return { kind: 'unavailable' };
    }
  }

  async isSessionRevoked(sessionId: string, expectedExpiresAt: Date): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { expiresAt: true },
    });
    return session === null || session.expiresAt <= new Date() || session.expiresAt.getTime() !== expectedExpiresAt.getTime();
  }
}
