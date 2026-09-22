import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  type DocumentNode,
  gql,
  InMemoryCache,
  type OperationVariables,
  ServerError,
  type TypedDocumentNode,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { canonicalStringify, print } from '@apollo/client/utilities';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { inject, injectable } from 'inversify';
import type {
  AuthSessionTransport,
  AuthSessionTransportHandlers,
} from '../../../application/identity/ports/auth-session-transport.port';
import type { AuthSession } from '../../../domains/identity/entities/auth-session';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { GenericAuthError } from '../../../domains/identity/errors/generic-auth-error';
import { AuthPayloadInspector } from '../../../domains/identity/services/auth-payload-inspector';
import {
  createDomainError,
  type DomainError,
  type DomainErrorDefinition,
  isDomainError,
} from '../../../domains/shared/errors/domain-error';
import { GRAPHQL_URL } from '../../config/api';
import { isSameAccessTokenSession, readAccessTokenClaims } from '../../identity/access-token-claims';
import { RefreshDocument, type RefreshMutation, type RefreshMutationVariables } from '../generated/graphql';

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
  private readonly pendingQueries = new Map<string, Promise<unknown>>();
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<Pick<AuthSession, 'accessToken'> | null> | null = null;
  private sessionRevision = 0;
  private credentialsRevision = 0;
  private renewalTimer?: ReturnType<typeof setTimeout>;

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
    if (this.accessToken === tokens.accessToken && this.refreshToken === tokens.refreshToken) return;
    if (!isSameAccessTokenSession(this.accessToken, tokens.accessToken)) this.sessionRevision++;
    this.refreshPromise = null;
    this.updateCredentials(tokens.accessToken, tokens.refreshToken);
  }

  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void {
    this.handlers = { ...handlers };
  }

  resolveDomainError<TCode extends string>(
    error: unknown,
    fallback: DomainErrorDefinition<TCode>,
    context?: Record<string, unknown>,
  ): DomainError<TCode | string> {
    if (isDomainError(error)) {
      return error;
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return createDomainError(
        {
          code: fallback.code,
          message: error.message,
          messageKey: fallback.messageKey,
        },
        {
          ...context,
          errorName: error.name,
          originalMessage: error.message,
        },
      );
    }

    return createDomainError(fallback, context);
  }

  private createClient(): ApolloClient {
    const authLink = new SetContextLink((context) => {
      const resolvedAuthToken = typeof context.authToken === 'string' ? context.authToken : undefined;

      return {
        headers: {
          ...GRAPHQL_UPLOAD_PREFLIGHT_HEADERS,
          ...context.headers,
          ...(resolvedAuthToken ? { Authorization: `Bearer ${resolvedAuthToken}` } : {}),
        },
      };
    });

    const httpLink = new UploadHttpLink({ uri: GRAPHQL_URL });

    return new ApolloClient({
      // Apollo's default key omits credentials. Queries are shared by session below.
      queryDeduplication: false,
      cache: new InMemoryCache(),
      link: ApolloLink.from([authLink, httpLink]),
    });
  }

  private async executeRequest<TData, TVariables extends OperationVariables>(
    operation: GraphqlOperationDocument<TData, TVariables>,
    variables?: TVariables,
    options?: GraphqlRequestOptions,
  ): Promise<TData> {
    const parsedOperation = typeof operation === 'string' ? gql(operation) : operation;
    const operationName = this.resolveOperationName(parsedOperation);
    const operationType = this.resolveOperationType(parsedOperation);

    const revision = this.sessionRevision;
    const credentialsRevision = this.credentialsRevision;
    const requestToken = options?.authToken ?? this.accessToken;
    try {
      return await this.executeOperation<TData, TVariables>(parsedOperation, variables, options?.authToken);
    } catch (error) {
      let normalizedError = this.normalizeApolloError(error);
      if (
        !options?.skipAuthRefresh &&
        revision === this.sessionRevision &&
        this.isAuthError(normalizedError.code, normalizedError.message)
      ) {
        const refreshed =
          requestToken !== this.accessToken && this.accessToken
            ? { accessToken: this.accessToken }
            : await this.refreshSession();
        if (revision === this.sessionRevision) {
          const retryToken = this.accessToken;
          const retryCredentialsRevision = this.credentialsRevision;
          if (retryToken && (refreshed || credentialsRevision !== retryCredentialsRevision)) {
            try {
              return await this.executeOperation<TData, TVariables>(parsedOperation, variables, retryToken);
            } catch (retryError) {
              normalizedError = this.normalizeApolloError(retryError);
            }
          }
          if (
            revision === this.sessionRevision &&
            retryCredentialsRevision === this.credentialsRevision &&
            this.isAuthError(normalizedError.code, normalizedError.message)
          )
            this.invalidateSession();
        }
      }

      throw createDomainError(
        {
          code: normalizedError.code ?? normalizedError.message,
          message: normalizedError.message,
          messageKey: normalizedError.code ?? normalizedError.message,
        },
        {
          graphQLErrorCode: normalizedError.code ?? null,
          operationName,
          operationType,
        },
      );
    }
  }

  private async executeOperation<TData, TVariables extends OperationVariables>(
    operation: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    authToken: string = this.accessToken ?? '',
  ): Promise<TData> {
    const operationDefinition = operation.definitions.find((definition) => definition.kind === 'OperationDefinition');

    const isMutation =
      operationDefinition?.kind === 'OperationDefinition' && operationDefinition.operation === 'mutation';
    const resolvedVariables = (variables ?? {}) as TVariables;
    const operationName = this.resolveOperationName(operation);

    const execute = async () => {
      const result = isMutation
        ? await this.client.mutate({
            mutation: operation,
            variables: resolvedVariables,
            context: { authToken },
            fetchPolicy: 'no-cache',
          })
        : await this.client.query({
            query: operation,
            variables: resolvedVariables,
            context: { authToken },
            fetchPolicy: 'no-cache',
          });

      if (!result.data) {
        throw new GenericAuthError({
          operationName,
          operationType: isMutation ? 'mutation' : 'query',
        });
      }

      return result.data;
    };

    if (isMutation) return execute();
    const key = canonicalStringify([this.credentialsRevision, authToken, print(operation), resolvedVariables]);
    const pending = this.pendingQueries.get(key);
    if (pending) return pending as Promise<TData>;
    const request = execute();
    this.pendingQueries.set(key, request);
    try {
      return await request;
    } finally {
      this.pendingQueries.delete(key);
    }
  }

  private resolveOperationName(document: DocumentNode): string | null {
    const operationDefinition = document.definitions.find((definition) => definition.kind === 'OperationDefinition');

    return operationDefinition?.name?.value ?? null;
  }

  private resolveOperationType(document: DocumentNode): 'mutation' | 'query' | 'subscription' | null {
    const operationDefinition = document.definitions.find((definition) => definition.kind === 'OperationDefinition');

    return operationDefinition?.kind === 'OperationDefinition' ? operationDefinition.operation : null;
  }

  private async refreshSession(): Promise<Pick<AuthSession, 'accessToken'> | null> {
    if (!this.refreshToken) return null;
    if (this.refreshPromise) return this.refreshPromise;

    const revision = this.credentialsRevision;
    const renew = async () => {
      if (revision !== this.credentialsRevision) return null;
      const stored = this.handlers.readSessionTokens?.();
      if (stored && (stored.accessToken !== this.accessToken || stored.refreshToken !== this.refreshToken)) {
        if (
          isSameAccessTokenSession(this.accessToken, stored.accessToken) &&
          stored.accessToken &&
          stored.refreshToken
        ) {
          this.updateCredentials(stored.accessToken, stored.refreshToken);
          return { accessToken: stored.accessToken };
        }
        this.setAuthSessionTokens(stored);
        return null;
      }
      const refreshToken = this.refreshToken;
      if (!refreshToken) return null;
      try {
        const result = await this.executeOperation<RefreshMutation, RefreshMutationVariables>(RefreshDocument, {
          input: { refreshToken },
        });
        const session = this.payloadInspector.toAuthSession(result.refresh);
        if (!session || revision !== this.credentialsRevision) return null;

        this.updateCredentials(session.accessToken, session.refreshToken);
        this.handlers.onSessionRefreshed?.(session);
        return session;
      } catch (error) {
        const normalized = this.normalizeApolloError(error);
        if (this.isAuthError(normalized.code, normalized.message)) return null;
        throw error;
      }
    };
    const promise =
      typeof navigator !== 'undefined' && navigator.locks
        ? navigator.locks.request('pleey-identity-refresh', renew)
        : renew();
    this.refreshPromise = promise;
    try {
      return await promise;
    } finally {
      if (this.refreshPromise === promise) this.refreshPromise = null;
    }
  }

  private updateCredentials(accessToken: string | null, refreshToken: string | null): void {
    this.credentialsRevision++;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.scheduleRenewal();
  }

  private scheduleRenewal(): void {
    clearTimeout(this.renewalTimer);
    if (!this.accessToken || !this.refreshToken) return;
    const payload = readAccessTokenClaims(this.accessToken);
    if (typeof payload?.exp !== 'number' || !Number.isFinite(payload.exp)) return;
    const expiresAt = payload.exp * 1000;
    const revision = this.credentialsRevision;
    const renew = async () => {
      try {
        const session = await this.refreshSession();
        if (!session && revision === this.credentialsRevision) this.invalidateSession();
      } catch {
        if (revision === this.credentialsRevision) this.renewalTimer = setTimeout(() => void renew(), 30_000);
      }
    };
    this.renewalTimer = setTimeout(
      () => void renew(),
      Math.max(1_000, Math.min(2_147_483_647, expiresAt - Date.now() - 30_000)),
    );
  }

  private invalidateSession(): void {
    this.setAuthSessionTokens({ accessToken: null, refreshToken: null });
    this.handlers.onSessionInvalidated?.();
  }

  private isAuthError(code: string | undefined, message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    if (typeof code === 'string') {
      if (['401', 'UNAUTHORIZED', 'UNAUTHENTICATED', 'INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_EXPIRED'].includes(code)) {
        return true;
      }
    }

    if (
      normalizedMessage.includes('unauthorized') ||
      normalizedMessage.includes('unauthenticated') ||
      normalizedMessage.includes('invalid refresh token') ||
      normalizedMessage.includes('refresh token expired')
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

    return AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC].message;
  }

  private normalizeApolloError(error: unknown): {
    message: string;
    code?: string;
  } {
    if (CombinedGraphQLErrors.is(error)) {
      const firstError = error.errors[0];
      const code = typeof firstError?.extensions?.code === 'string' ? firstError.extensions.code : undefined;

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
        message:
          error.statusCode === 401
            ? AUTH_ERROR_DEFINITIONS[AuthErrorCode.UNAUTHORIZED].message
            : AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC].message,
        code: String(error.statusCode),
      };
    }

    if (isDomainError(error)) {
      return { code: error.code, message: error.message };
    }

    if (error instanceof Error && error.message.length > 0) {
      return { message: error.message };
    }

    return { message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC].message };
  }
}
