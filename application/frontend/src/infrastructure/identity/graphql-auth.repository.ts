import type { PaginationQuery } from '@pleey/contracts/shared/primitives';
import { inject, injectable } from 'inversify';
import type { User } from '../../domains/identity/entities/user';
import type { UserSessionOverview } from '../../domains/identity/entities/user-session-details';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../domains/identity/errors/auth-error-code';
import { GenericAuthError } from '../../domains/identity/errors/generic-auth-error';
import {
  InvalidLoginResponseError,
  InvalidRegenerateAvatarResponseError,
  InvalidUpdateProfileResponseError,
} from '../../domains/identity/errors/graphql-auth-repository.error';
import type {
  AuthRepository,
  UpdateProfileInput,
  UserGameHistoryPage,
} from '../../domains/identity/ports/auth-repository';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  MeDocument,
  type MeQuery,
  MyGameHistoryDocument,
  type MyGameHistoryQuery,
  type MyGameHistoryQueryVariables,
  RegenerateAvatarDocument,
  type RegenerateAvatarMutation,
  UpdateProfileDocument,
  type UpdateProfileMutation,
  type UpdateProfileMutationVariables,
} from '../graphql/generated/graphql';
import { betterAuthClient } from './better-auth-client';

@injectable()
export class GraphqlAuthRepository implements AuthRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(AuthPayloadInspector)
    private readonly payloadInspector: AuthPayloadInspector,
  ) {}

  async currentUser(): Promise<User> {
    const result = await this.graphqlClient.request<MeQuery>(MeDocument);
    const user = this.payloadInspector.toUser(result.me);
    if (!user) throw new InvalidLoginResponseError({ operationName: 'me' });
    return user;
  }

  async gameHistory(query: PaginationQuery): Promise<UserGameHistoryPage> {
    const result = await this.graphqlClient.request<MyGameHistoryQuery, MyGameHistoryQueryVariables>(
      MyGameHistoryDocument,
      { input: query },
    );
    return result.myGameHistory;
  }

  async sessions(query: PaginationQuery): Promise<UserSessionOverview> {
    const [sessionsResult, currentResult] = await Promise.all([
      betterAuthClient.listSessions(),
      betterAuthClient.getSession(),
    ]);
    if (sessionsResult.error || !sessionsResult.data || currentResult.error || !currentResult.data) {
      throw new GenericAuthError({ operationName: 'sessions', operationType: 'query' });
    }
    const sessions = sessionsResult.data.map((session) => ({
      id: session.id,
      createdAt: session.createdAt?.toISOString() ?? null,
      expiresAt: session.expiresAt.toISOString(),
      ipAddress: session.ipAddress ?? null,
      lastActiveAt: session.updatedAt?.toISOString() ?? null,
      userAgent: session.userAgent ?? null,
    }));
    const currentSessionId = currentResult.data.session.id;
    const currentSession = sessions.find(({ id }) => id === currentSessionId);
    if (!currentSession) throw new GenericAuthError({ operationName: 'sessions', operationType: 'query' });
    const otherSessions = sessions.filter(({ id }) => id !== currentSession.id);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    return {
      currentSession,
      otherSessions: {
        items: otherSessions.slice((page - 1) * pageSize, page * pageSize),
        overallCount: otherSessions.length,
        page,
        pageSize,
        totalCount: otherSessions.length,
        totalPages: Math.ceil(otherSessions.length / pageSize),
      },
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    const sessions = await betterAuthClient.listSessions();
    if (sessions.error || !sessions.data) {
      throw new GenericAuthError({ operationName: 'revokeSession', operationType: 'mutation' });
    }
    const session = sessions.data.find(({ id }) => id === sessionId);
    if (!session) throw new GenericAuthError({ operationName: 'revokeSession', operationType: 'mutation' });
    const result = await betterAuthClient.revokeSession({ token: session.token });
    if (result.error) throw new GenericAuthError({ operationName: 'revokeSession', operationType: 'mutation' });
  }

  async revokeOtherSessions(): Promise<void> {
    const result = await betterAuthClient.revokeOtherSessions();
    if (result.error) throw new GenericAuthError({ operationName: 'revokeOtherSessions', operationType: 'mutation' });
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    try {
      const result = await this.graphqlClient.request<UpdateProfileMutation, UpdateProfileMutationVariables>(
        UpdateProfileDocument,
        { input },
      );
      const user = this.payloadInspector.toUser(result.updateProfile);
      if (!user) throw new InvalidUpdateProfileResponseError({ operationName: 'updateProfile' });
      return user;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operationName: 'updateProfile',
      });
    }
  }

  async regenerateAvatar(): Promise<User> {
    try {
      const result = await this.graphqlClient.request<RegenerateAvatarMutation>(RegenerateAvatarDocument);
      const user = this.payloadInspector.toUser(result.regenerateAvatar);
      if (!user) throw new InvalidRegenerateAvatarResponseError({ operationName: 'regenerateAvatar' });
      return user;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operationName: 'regenerateAvatar',
      });
    }
  }
}
