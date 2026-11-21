import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AppEnvironment } from './app-environment';

describe('AppEnvironment', () => {
  it('distinguishes a required explicit empty value from an absent setting', () => {
    // Arrange
    const environment = new AppEnvironment({ TRUSTED_PROXY_CIDRS: '  ' });
    // Act + Assert
    expect(environment.getRequiredStringAllowEmpty('TRUSTED_PROXY_CIDRS')).toBe('');
    expect(() => environment.getRequiredStringAllowEmpty('MISSING')).toThrow(
      'MISSING environment variable is not defined',
    );
  });

  it('preserves absence for optional values and rejects empty required values', () => {
    // Arrange
    const environment = new AppEnvironment({ EMPTY: '  ' });
    // Act + Assert
    expect(environment.getOptionalString('MISSING')).toBeUndefined();
    expect(environment.getOptionalString('EMPTY')).toBeUndefined();
    expect(() => environment.getRequiredString('EMPTY')).toThrow('EMPTY environment variable is not defined');
  });

  it('rejects empty secret files while allowing an explicitly empty proxy-list file', () => {
    // Arrange
    const directory = mkdtempSync(join(tmpdir(), 'pleey-config-reader-'));
    const file = join(directory, 'empty');
    writeFileSync(file, ' \n');
    const environment = new AppEnvironment({ SECRET_FILE: file, TRUSTED_PROXY_CIDRS_FILE: file });
    // Act + Assert
    try {
      expect(() => environment.getRequiredString('SECRET')).toThrow('is empty');
      expect(environment.getRequiredStringAllowEmpty('TRUSTED_PROXY_CIDRS')).toBe('');
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  it('prefers direct values to file values, including intentional empty trust lists', () => {
    // Arrange
    const environment = new AppEnvironment({
      SECRET: 'direct-secret',
      SECRET_FILE: '/not/read',
      TRUSTED_PROXY_CIDRS: '',
      TRUSTED_PROXY_CIDRS_FILE: '/not/read',
    });
    // Act + Assert
    expect(environment.getRequiredString('SECRET')).toBe('direct-secret');
    expect(environment.getRequiredStringAllowEmpty('TRUSTED_PROXY_CIDRS')).toBe('');
  });
});
