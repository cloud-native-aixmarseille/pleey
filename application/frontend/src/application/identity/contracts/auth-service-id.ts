export const AUTH_SERVICE_ID = {
  authRepository: Symbol.for('authRepository'),
  authSessionTransport: Symbol.for('authSessionTransport'),
  storagePort: Symbol.for('storagePort'),
} as const;
