import { readFileSync } from 'node:fs';
import process from 'node:process';

type EnvironmentSource = NodeJS.ProcessEnv;

export class AppEnvironment {
  constructor(private readonly values: EnvironmentSource = process.env) {}

  getOptionalString(name: string): string | undefined {
    const direct = this.normalizeValue(this.values[name]);
    if (direct) {
      return direct;
    }

    const filePath = this.normalizeValue(this.values[`${name}_FILE`]);
    if (!filePath) {
      return undefined;
    }

    return this.readSecretFile(filePath);
  }

  getRequiredString(name: string): string {
    const value = this.getOptionalString(name);
    if (!value) {
      throw new Error(`${name} environment variable is not defined`);
    }

    return value;
  }

  isProduction(): boolean {
    return this.getOptionalString('NODE_ENV') === 'production';
  }

  getNodeEnvironment(): string {
    return this.getOptionalString('NODE_ENV') ?? 'development';
  }

  private normalizeValue(value: string | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private readSecretFile(filePath: string): string {
    const contents = readFileSync(filePath, { encoding: 'utf8' });
    const trimmed = contents.trim();
    if (trimmed.length === 0) {
      throw new Error(`Secret file at ${filePath} is empty`);
    }

    return trimmed;
  }
}
