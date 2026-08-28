import { injectable } from 'inversify';
import type { ApplicationVersionPort } from '../../application/shared/ports/application-version.port';
import { createDomainError } from '../../domains/shared/errors/domain-error';
import { API_URL } from './api';

interface ApplicationVersionResponse {
  readonly version?: unknown;
}

@injectable()
export class HttpApplicationVersionAdapter implements ApplicationVersionPort {
  async loadApplicationVersion(): Promise<string> {
    const response = await fetch(new URL('/api/version', `${API_URL}/`));

    if (!response.ok) {
      throw createDomainError(
        {
          code: 'APPLICATION_VERSION_LOAD_FAILED',
          message: `Failed to load application version (${response.status})`,
          messageKey: 'APPLICATION_VERSION_LOAD_FAILED',
        },
        {
          status: response.status,
        },
      );
    }

    const payload = (await response.json()) as ApplicationVersionResponse;

    return typeof payload.version === 'string' ? payload.version.trim() : '';
  }
}
