export type AppServerConfig = {
  isDevelopment: boolean;
  isProduction: boolean;
  port: number;
};

export const APP_SERVER_CONFIG = Symbol('APP_SERVER_CONFIG');
