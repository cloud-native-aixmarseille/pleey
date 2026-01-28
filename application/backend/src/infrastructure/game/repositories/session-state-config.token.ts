export type SessionStateConfig = {
  ttlSeconds: number;
  valkeyUrl?: string;
};

export const SESSION_STATE_CONFIG = Symbol('SESSION_STATE_CONFIG');
