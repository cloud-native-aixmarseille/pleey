import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  type DocumentNode,
  type FetchResult,
  gql,
  InMemoryCache,
  type OperationVariables,
  ServerError,
  type TypedDocumentNode,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { inject, injectable } from 'inversify';
import type {
  AuthSessionTransport,
  AuthSessionTransportHandlers,
} from '../../../application/identity/contracts/auth-runtime.port';
import type { AuthSession } from '../../../domains/identity/entities/auth-session';
import { AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { AuthPayloadInspector } from '../../../domains/identity/services/auth-payload-inspector';
import { GRAPHQL_URL } from '../../config/api';
import {
  RefreshDocument,
  type RefreshMutation,
  type RefreshMutationVariables,
} from '../generated/graphql';

interface GraphqlRequestOptions {
  readonly authToken?: string;
  readonly skipAuthRefresh?: boolean;
}

type GraphQLErrorPayload = {
  readonly message?: string;
  readonly extensions?: {
    readonly code?: string;
    readonly originalError?: {
      readonly message?: string | string[];
      readonly error?: string;
    };
  };
};

type GraphqlOperationDocument<TData, TVariables extends OperationVariables> =
  | string
  | DocumentNode
  | TypedDocumentNode<TData, TVariables>;

const GRAPHQL_UPLOAD_PREFLIGHT_HEADERS = {
  'apollo-require-preflight': 'true',
} as const;

@injectable()
export class GraphqlClient implements AuthSessionTransport {
  private handlers: AuthSessionTransportHandlers = {};
  private readonly client: ApolloClient;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<AuthSession | null> | null = null;

  constructor(
    @inject(AuthPayloadInspector)
    private readonly payloadInspector: AuthPayloadInspector,
  ) {
    this.client = this.createClient();
  }

  request<TData, TVariables extends OperationVariables = OperationVariables>(
    operation: GraphqlOperationDocument<TData, TVariables>,
    variables?: TVariables,
    options?: GraphqlRequestOptions,
  ): Promise<TData> {
    return this.executeRequest(operation, variables, options);
  }

  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void {
    this.handlers = { ...handlers };
  }

  extractMessage(error: unknown, fallback: string): string {
    const message = this.normalizeApolloError(error).message.trim();

    return message.length > 0 ? message : fallback;
  }

  private createClient(): ApolloClient {
    const authLink = new SetContextLink((context) => {
      const contextAuthToken =
        typeof context.authToken === 'string' ? context.authToken : undefined;

      const resolvedAuthToken = contextAuthToken ?? this.accessToken;

      return {
        headers: {
          ...GRAPHQL_UPLOAD_PREFLIGHT_HEADERS,
          ...context.headers,
          ...(resolvedAuthToken ? { Authorization: `Bearer ${resolvedAuthToken}` } : {}),
        },
      };
    });

    const errorLink = new ErrorLink(({ error }) => {
      if (ServerError.is(error) && error.statusCode === 401) {
        this.invalidateSession();
        return;
      }

      if (!CombinedGraphQLErrors.is(error)) {
        return;
      }

      const isUnauthorized = error.errors.some((entry) => {
        const code = typeof entry.extensions?.code === 'string' ? entry.extensions.code : undefined;
        const message = entry.message ?? '';

        return this.isAuthError(code, message);
      });

      if (isUnauthorized) {
        this.accessToken = null;
      }
    });

    const httpLink = new UploadHttpLink({ uri: GRAPHQL_URL });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([errorLink, authLink, httpLink]),
    });
  }

  private async executeRequest<TData, TVariables extends OperationVariables>(
    operation: GraphqlOperationDocument<TData, TVariables>,
    variables?: TVariables,
    options?: GraphqlRequestOptions,
  ): Promise<TData> {
    try {
      return await this.executeOperation<TData, TVariables>(
        operation,
        variables,
        options?.authToken,
      );
    } catch (error) {
      const normalizedError = this.normalizeApolloError(error);

      if (
        !options?.skipAuthRefresh &&
        this.refreshToken &&
        this.isAuthError(normalizedError.code, normalizedError.message)
      ) {
        const refreshed = await this.refreshSession();

        if (refreshed) {
          return this.executeRequest<TData, TVariables>(operation, variables, {
            ...options,
            authToken: refreshed.accessToken,
            skipAuthRefresh: true,
          });
        }

        this.invalidateSession();
      }

      throw new Error(normalizedError.message);
    }
  }

  private async executeOperation<TData, TVariables extends OperationVariables>(
    operation: GraphqlOperationDocument<TData, TVariables>,
    variables?: TVariables,
    authToken?: string,
  ): Promise<TData> {
    const parsedDocument = typeof operation === 'string' ? gql(operation) : operation;

    const operationDefinition = parsedDocument.definitions.find(
      (definition) => definition.kind === 'OperationDefinition',
    );

    const isMutation =
      operationDefinition?.kind === 'OperationDefinition' &&
      operationDefinition.operation === 'mutation';
    const resolvedVariables = (variables ?? {}) as TVariables;

    let result: FetchResult<TData>;

    if (isMutation) {
      result = await this.client.mutate<TData, TVariables>({
        mutation: parsedDocument,
        variables: resolvedVariables,
        context: { authToken },
        fetchPolicy: 'no-cache',
      });
    } else {
      result = await this.client.query<TData, TVariables>({
        query: parsedDocument,
        variables: resolvedVariables,
        context: { authToken },
        fetchPolicy: 'no-cache',
      });
    }

    if (!result.data) {
      throw new Error(AuthErrorCode.GENERIC);
    }

    return result.data;
  }

  private async refreshSession(): Promise<AuthSession | null> {
    if (!this.refreshToken) {
      return null;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const result = await this.executeOperation<RefreshMutation, RefreshMutationVariables>(
            RefreshDocument,
            { input: { refreshToken: this.refreshToken ?? '' } },
          );

          const session = this.payloadInspector.toAuthSession(result.refresh);

          if (!session) {
            return null;
          }

          this.setAuthSessionTokens({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          });
          this.handlers.onSessionRefreshed?.(session);
          return session;
        } catch {
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private invalidateSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.handlers.onSessionInvalidated?.();
  }

  private isAuthError(code: string | undefined, message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    if (typeof code === 'string') {
      if (['UNAUTHORIZED', 'UNAUTHENTICATED', 'FORBIDDEN'].includes(code)) {
        return true;
      }
    }

    if (
      normalizedMessage.includes('unauthorized') ||
      normalizedMessage.includes('unauthenticated') ||
      normalizedMessage.includes('forbidden') ||
      normalizedMessage.includes('invalid refresh token') ||
      normalizedMessage.includes('refresh token')
    ) {
      return true;
    }

    return [
      AuthErrorCode.UNAUTHORIZED,
      AuthErrorCode.INVALID_REFRESH_TOKEN,
      AuthErrorCode.REFRESH_TOKEN_EXPIRED,
    ].includes(message as AuthErrorCode);
  }

  private resolveGraphqlErrorMessage(error: GraphQLErrorPayload): string {
    const original = error.extensions?.originalError?.message;

    if (Array.isArray(original) && typeof original[0] === 'string') {
      return original[0];
    }

    if (typeof original === 'string') {
      return original;
    }

    if (typeof error.extensions?.originalError?.error === 'string') {
      return error.extensions.originalError.error;
    }

    if (typeof error.message === 'string' && error.message.length > 0) {
      return error.message;
    }

    return AuthErrorCode.GENERIC;
  }

  private normalizeApolloError(error: unknown): {
    message: string;
    code?: string;
  } {
    if (CombinedGraphQLErrors.is(error)) {
      const firstError = error.errors[0];
      const code =
        typeof firstError?.extensions?.code === 'string' ? firstError.extensions.code : undefined;

      const message = firstError
        ? this.resolveGraphqlErrorMessage({
            message: firstError.message,
            extensions: {
              code,
              originalError:
                typeof firstError.extensions?.originalError === 'object'
                  ? (firstError.extensions.originalError as {
                      message?: string | string[];
                      error?: string;
                    })
                  : undefined,
            },
          })
        : AuthErrorCode.GENERIC;

      return { message, code };
    }

    if (ServerError.is(error)) {
      return {
        message: error.statusCode === 401 ? AuthErrorCode.UNAUTHORIZED : AuthErrorCode.GENERIC,
        code: String(error.statusCode),
      };
    }

    if (error instanceof Error && error.message.length > 0) {
      return { message: error.message };
    }

    return { message: AuthErrorCode.GENERIC };
  }
}
