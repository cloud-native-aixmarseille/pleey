import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DatabaseReadinessFixture } from '../src/test-utils/fixtures/unit/database-readiness.fixture';

const readinessModule = pathToFileURL(resolve(import.meta.dirname, 'wait-for-database.mjs')).href;
const { DatabaseReadiness } = await import(readinessModule);

describe('DatabaseReadiness', () => {
  it('waits for a late secret and authenticates with the complete URI', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.readSecret.mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }));
    fixture.readSecret.mockResolvedValueOnce('');
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act
    await readiness.wait({ secretFile: '/secret/uri', timeoutMs: 10000 });
    // Assert
    expect(fixture.createClient).toHaveBeenCalledWith(fixture.uri, 5000);
    expect(fixture.query).toHaveBeenCalledWith(['SELECT 1']);
    expect(fixture.disconnect).toHaveBeenCalledOnce();
  });

  it('disconnects a failed attempt before retrying a transient connection failure', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.query.mockRejectedValueOnce(Object.assign(new Error('unavailable'), { code: 'P1001' }));
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act
    await readiness.wait({ secretFile: '/secret/uri', timeoutMs: 10000 });
    // Assert
    expect(fixture.disconnect).toHaveBeenCalledTimes(2);
    expect(fixture.disconnect.mock.invocationCallOrder[0]).toBeLessThan(fixture.createClient.mock.invocationCallOrder[1]);
  });

  it('fails at the overall deadline when a secret never appears', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.readSecret.mockResolvedValue('');
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs: 2500 })).rejects.toThrow('DATABASE_READINESS_TIMEOUT');
    expect(fixture.elapsed).toBe(2500);
    expect(fixture.createClient).not.toHaveBeenCalled();
  });

  it('rejects invalid credentials without logging the URI or driver message', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.query.mockRejectedValue(Object.assign(new Error(`Authentication failed: ${fixture.uri}`), { code: 'P1000' }));
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs: 2500 })).rejects.toThrow('DATABASE_READINESS_TIMEOUT');
    expect(fixture.log.mock.calls.flat().join('\n')).not.toContain('test-password');
    expect(fixture.log.mock.calls.flat().join('\n')).toContain('code=P1000');
  });

  it('bounds a stalled query and starts cleanup', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.query.mockImplementation(() => new Promise(() => {}));
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs: 20 })).rejects.toThrow('DATABASE_READINESS_TIMEOUT');
    expect(fixture.disconnect).toHaveBeenCalledOnce();
  });

  it('bounds cleanup after a successful query', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    fixture.disconnect.mockImplementation(() => new Promise(() => {}));
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs: 20 })).rejects.toThrow('DATABASE_READINESS_TIMEOUT');
  });

  it('cleans up on cancellation without starting another attempt', async () => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    const controller = new AbortController();
    fixture.query.mockImplementation(async () => { controller.abort(); return []; });
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs: 10000, signal: controller.signal })).rejects.toThrow('DATABASE_READINESS_CANCELLED');
    expect(fixture.disconnect).toHaveBeenCalledOnce();
    expect(fixture.createClient).toHaveBeenCalledOnce();
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.5])('rejects invalid timeout %s', async (timeoutMs) => {
    // Arrange
    const fixture = new DatabaseReadinessFixture();
    const readiness = new DatabaseReadiness(fixture.dependencies());
    // Act + Assert
    await expect(readiness.wait({ secretFile: '/secret/uri', timeoutMs })).rejects.toThrow('DATABASE_READINESS_INVALID_ARGUMENTS');
  });
});
