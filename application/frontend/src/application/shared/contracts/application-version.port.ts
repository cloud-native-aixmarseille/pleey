export const APPLICATION_VERSION_PORT = Symbol.for('applicationVersionPort');

export interface ApplicationVersionPort {
  loadApplicationVersion(): Promise<string>;
}
