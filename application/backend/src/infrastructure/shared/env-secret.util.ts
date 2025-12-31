import { readFileSync } from 'node:fs';

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readSecretFile(filePath: string): string {
  const contents = readFileSync(filePath, { encoding: 'utf8' });
  const trimmed = contents.trim();
  if (trimmed.length === 0) {
    throw new Error(`Secret file at ${filePath} is empty`);
  }
  return trimmed;
}

export function getEnvOrFile(name: string): string | undefined {
  const direct = normalizeEnvValue(process.env[name]);
  if (direct) {
    return direct;
  }

  const filePath = normalizeEnvValue(process.env[`${name}_FILE`]);
  if (!filePath) {
    return undefined;
  }

  return readSecretFile(filePath);
}

export function getRequiredEnvOrFile(name: string): string {
  const value = getEnvOrFile(name);
  if (!value) {
    throw new Error(`${name} environment variable is not defined`);
  }
  return value;
}
