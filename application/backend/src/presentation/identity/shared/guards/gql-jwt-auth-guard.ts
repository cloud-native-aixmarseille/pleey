import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { AuthenticatedRequest } from '../context/authenticated-request';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): AuthenticatedRequest {
    const graphqlContext = GqlExecutionContext.create(context).getContext<{
      req?: AuthenticatedRequest;
      user?: {
        id: UserId;
        username: string;
      };
    }>();

    if (graphqlContext.req) {
      return graphqlContext.req;
    }

    return {
      user: graphqlContext.user,
    } as AuthenticatedRequest;
  }
}
