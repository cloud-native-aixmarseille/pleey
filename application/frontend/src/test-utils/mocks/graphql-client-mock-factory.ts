import { vi } from 'vitest';
import { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';

type GraphqlRequestMock = (
  operation: string,
  variables?: Record<string, unknown>,
  options?: undefined,
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
    super();
  }

  override request<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
    operation: string,
    variables?: TVariables,
  ): Promise<TData> {
    return this.requestMockImpl(operation, variables, undefined) as Promise<TData>;
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
