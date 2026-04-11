import type { ErrorCodeHttpStatusPort } from './error-code-http-status.port';

export abstract class AbstractErrorCodeHttpStatusService<TErrorCode extends string>
  implements ErrorCodeHttpStatusPort
{
  private readonly errorCodes: ReadonlySet<TErrorCode>;

  protected constructor(
    errorCodes: readonly TErrorCode[],
    private readonly statuses: Readonly<Record<TErrorCode, number>>,
  ) {
    this.errorCodes = new Set(errorCodes);
  }

  canResolve(code: string): boolean {
    return this.errorCodes.has(code as TErrorCode);
  }

  resolve(code: string): number {
    return this.statuses[code as TErrorCode];
  }
}
