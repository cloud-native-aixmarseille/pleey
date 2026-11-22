import type { ExecutionContext } from '@nestjs/common';
import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { BetterAuthSessionAdapter } from '../../../../infrastructure/identity/better-auth-session.adapter';
import type { AuthenticatedRequest } from '../context/authenticated-request';

@Injectable()
export class GqlAuthGuard {
  constructor(
    private readonly sessions: BetterAuthSessionAdapter,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphqlContext = GqlExecutionContext.create(context).getContext<{
      req?: AuthenticatedRequest;
      user?: {
        id: UserId;
        username: string;
      };
    }>();
    const request = graphqlContext.req;
    if (!request) throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    const session = await this.sessions.getSession(request);
    if (session.kind !== 'valid') {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }
    const allowsAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_SESSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (session.isAnonymous && !allowsAnonymous) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }
    request.user = {
      id: session.userId as UserId,
      username: '',
      avatar: null,
      sessionId: session.sessionId,
      isAnonymous: session.isAnonymous,
    };
    return true;
  }
}

const ALLOW_ANONYMOUS_SESSION = 'pleey:allowAnonymousSession';

export const AllowAnonymousSession = () => SetMetadata(ALLOW_ANONYMOUS_SESSION, true);
