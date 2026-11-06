import { vi } from 'vitest';

export class DatabaseReadinessFixture {
  readonly uri = 'postgresql://test-user:test-password@database.test/pleey?sslmode=require';
  elapsed = 0;
  readonly query = vi.fn(async (_query: TemplateStringsArray) => [{ value: 1 }]);
  readonly disconnect = vi.fn(async () => {});
  readonly readSecret = vi.fn(async (_file: string) => this.uri);
  readonly createClient = vi.fn((_uri: string, _timeout: number) => ({
    $queryRaw: this.query,
    $disconnect: this.disconnect,
  }));
  readonly sleep = vi.fn(async (milliseconds: number) => {
    this.elapsed += milliseconds;
  });
  readonly log = vi.fn();

  dependencies() {
    return {
      readSecret: this.readSecret,
      createClient: this.createClient,
      sleep: this.sleep,
      now: () => this.elapsed,
      log: this.log,
    };
  }
}
