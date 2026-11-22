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
import { injectable } from 'inversify';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { GenericAuthError } from '../../../domains/identity/errors/generic-auth-error';
import {
  createDomainError,
  type DomainError,
  type DomainErrorDefinition,
  isDomainError,
} from '../../../domains/shared/errors/domain-error';
import { GRAPHQL_URL } from '../../config/api';

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
export class GraphqlClient {
  private readonly client: ApolloClient;
  private readonly pendingQueries = new Map<string, Promise<unknown>>();

  constructor() {
    this.client = this.createClient();
  }

  request<TData, TVariables extends OperationVariables = OperationVariables>(
    operation: GraphqlOperationDocument<TData, TVariables>,
    variables?: TVariables,
  ): Promise<TData> {
    return this.executeRequest(operation, variables);
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
      return {
        headers: {
          ...GRAPHQL_UPLOAD_PREFLIGHT_HEADERS,
          ...context.headers,
        },
      };
    });

    const httpLink = new UploadHttpLink({ uri: GRAPHQL_URL, credentials: 'include' });

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
  ): Promise<TData> {
    const parsedOperation = typeof operation === 'string' ? gql(operation) : operation;
    const operationName = this.resolveOperationName(parsedOperation);
    const operationType = this.resolveOperationType(parsedOperation);

    try {
      return await this.executeOperation<TData, TVariables>(parsedOperation, variables);
    } catch (error) {
      const normalizedError = this.normalizeApolloError(error);

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
            fetchPolicy: 'no-cache',
          })
        : await this.client.query({
            query: operation,
            variables: resolvedVariables,
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
    const key = canonicalStringify([print(operation), resolvedVariables]);
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
