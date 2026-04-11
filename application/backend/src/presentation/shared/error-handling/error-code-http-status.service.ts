import { Inject, Injectable } from '@nestjs/common';
import type { ErrorCodeHttpStatusPort } from './error-code-http-status.port';
import { ERROR_CODE_HTTP_STATUS_RESOLVERS } from './error-code-http-status-resolvers.token';

@Injectable()
export class ErrorCodeHttpStatusService {
  constructor(
    @Inject(ERROR_CODE_HTTP_STATUS_RESOLVERS)
    private readonly resolvers: readonly ErrorCodeHttpStatusPort[],
  ) {}

  resolve(errorCode: string): number {
    for (const resolver of this.resolvers) {
      if (resolver.canResolve(errorCode)) {
        return resolver.resolve(errorCode);
      }
    }

    return 500;
  }
}
