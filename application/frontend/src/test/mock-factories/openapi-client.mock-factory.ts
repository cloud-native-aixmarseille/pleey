import { fetchClient } from "../../infrastructure/shared/http/api/openapiClient";

type FetchClient = typeof fetchClient;
type MethodKey = keyof FetchClient;

type ClientResult<TMethod extends MethodKey> = Awaited<ReturnType<FetchClient[TMethod]>>;

const createDefaultResult = () => ({
  data: undefined,
  error: undefined,
  response: new Response(),
});

export const createFetchClientResult = <TMethod extends MethodKey>(
  overrides: Partial<ClientResult<TMethod>>,
): ClientResult<TMethod> => ({
  ...createDefaultResult(),
  ...overrides,
}) as ClientResult<TMethod>;
