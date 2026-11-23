export const APPLICATION_SHELL_CONFIG_PORT = Symbol.for('applicationShellConfigPort');

export interface ApplicationShellConfig {
  readonly appVersion: string;
  readonly feedbackUrl: string;
}

export interface ApplicationShellConfigPort {
  loadApplicationShellConfig(): Promise<ApplicationShellConfig>;
}
