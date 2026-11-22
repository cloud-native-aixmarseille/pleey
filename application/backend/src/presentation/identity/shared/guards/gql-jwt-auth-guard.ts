import type { ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { AuthenticatedRequest } from '../context/authenticated-request';
import { BetterAuthSessionAdapter } from '../../../../infrastructure/identity/better-auth-session.adapter';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';

@Injectable()
export class GqlJwtAuthGuard {
  constructor(private readonly sessions: BetterAuthSessionAdapter) {}

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
