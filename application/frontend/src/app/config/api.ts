import { AppEnvReader } from './app-env-reader';

const env = new AppEnvReader().read();

export const GRAPHQL_URL = env.graphqlPath;
export const SOCKET_URL = env.socketPath;
