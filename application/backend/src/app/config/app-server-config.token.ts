export type AppServerConfig = {
  graphiqlEnabled: boolean;
  graphqlIntrospectionEnabled: boolean;
  graphqlSchemaOutputPath?: string;
  i18nWatchEnabled: boolean;
  port: number;
  trustedProxyCidrs: string[];
};

export const APP_SERVER_CONFIG = Symbol('APP_SERVER_CONFIG');
