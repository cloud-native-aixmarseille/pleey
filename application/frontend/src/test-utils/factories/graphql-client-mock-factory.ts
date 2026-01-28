import { vi } from 'vitest';
import { AuthPayloadInspector } from '../../domains/auth/services/auth-payload-inspector';
import { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';

type GraphqlRequestMock = (
  operation: string,
  variables?: Record<string, unknown>,
  options?: {
    readonly authToken?: string;
    readonly skipAuthRefresh?: boolean;
  },
) => Promise<unknown>;

interface GraphqlClientMockFactoryOptions {
  readonly requestResult?: unknown;
  readonly requestError?: Error;
}

interface GraphqlClientMock {
  readonly client: GraphqlClient;
  readonly requestMock: ReturnType<typeof vi.fn>;
}

class GraphqlClientDouble extends GraphqlClient {
  constructor(private readonly requestMockImpl: GraphqlRequestMock) {
    super(new AuthPayloadInspector());
  }

  override request<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
    operation: string,
    variables?: TVariables,
    options?: {
      readonly authToken?: string;
      readonly skipAuthRefresh?: boolean;
    },
  ): Promise<TData> {
    return this.requestMockImpl(operation, variables, options) as Promise<TData>;
  }
}

export class GraphqlClientMockFactory {
  create({ requestResult, requestError }: GraphqlClientMockFactoryOptions = {}): GraphqlClientMock {
    const requestMock = requestError
      ? vi.fn().mockRejectedValue(requestError)
      : vi.fn().mockResolvedValue(requestResult);

    return {
      client: new GraphqlClientDouble(requestMock),
      requestMock,
    };
  }
}
