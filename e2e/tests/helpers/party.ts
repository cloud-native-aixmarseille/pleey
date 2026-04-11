import type { APIRequestContext } from "@playwright/test";

type PartySummary = {
  partyId: number;
  gameId: number;
  pin: string;
  status: string;
  role: "HOST" | "PLAYER";
  createdAt: string;
};

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message?: string }>;
};

const DEFAULT_GRAPHQL_URL = "http://backend:3001/graphql";
const DEFAULT_SEEDED_GAME_ID = 18;

function resolveGraphqlUrl(): string {
  const apiBaseUrl = (process.env.API_BASE_URL ?? "http://backend:3001/api").replace(/\/+$/, "");

  return apiBaseUrl.endsWith("/graphql")
    ? apiBaseUrl
    : `${apiBaseUrl.replace(/\/api$/, "")}/graphql`;
}

function resolveSeededGameId(): number {
  const configuredGameId = Number(process.env.E2E_PARTY_GAME_ID ?? DEFAULT_SEEDED_GAME_ID);

  return Number.isInteger(configuredGameId) && configuredGameId > 0
    ? configuredGameId
    : DEFAULT_SEEDED_GAME_ID;
}

async function executeGraphql<TData>(
  request: APIRequestContext,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const response = await request.post(resolveGraphqlUrl() || DEFAULT_GRAPHQL_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "apollo-require-preflight": "true",
      "Content-Type": "application/json",
    },
    data: {
      query,
      variables,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `GraphQL request failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "Unknown GraphQL error.");
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not contain any data.");
  }

  return payload.data;
}

async function listParties(
  request: APIRequestContext,
  accessToken: string,
): Promise<readonly PartySummary[]> {
  const data = await executeGraphql<{ listParties: PartySummary[] }>(
    request,
    accessToken,
    `
      query ListParties {
        listParties {
          partyId
          gameId
          pin
          status
          role
          createdAt
        }
      }
    `,
  );

  return data.listParties;
}

async function createParty(
  request: APIRequestContext,
  accessToken: string,
  gameId: number,
): Promise<PartySummary> {
  const data = await executeGraphql<{ createParty: PartySummary }>(
    request,
    accessToken,
    `
      mutation CreateParty($input: CreatePartyInput!) {
        createParty(input: $input) {
          partyId
          gameId
          pin
          status
          role
          createdAt
        }
      }
    `,
    {
      input: { gameId },
    },
  );

  return data.createParty;
}

export async function ensureHostParty(
  request: APIRequestContext,
  accessToken: string,
): Promise<PartySummary> {
  const existingHostParty = [...(await listParties(request, accessToken))]
    .filter((party) => party.role === "HOST")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  if (existingHostParty) {
    return existingHostParty;
  }

  try {
    return await createParty(request, accessToken, resolveSeededGameId());
  } catch {
    const recoveredHostParty = [...(await listParties(request, accessToken))]
      .filter((party) => party.role === "HOST")
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    if (recoveredHostParty) {
      return recoveredHostParty;
    }

    throw new Error("Unable to create or recover a host party for the E2E route check.");
  }
}