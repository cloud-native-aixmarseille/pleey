import { readAppEnv } from './app-env-reader';

const env = readAppEnv();

export const GRAPHQL_URL = env.graphqlPath;
export const SOCKET_URL = env.socketPath;
