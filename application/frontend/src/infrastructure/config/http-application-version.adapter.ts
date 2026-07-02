import { injectable } from 'inversify';
import type { ApplicationVersionPort } from '../../application/shared/contracts/application-version.port';
import { API_URL } from './api';

interface ApplicationVersionResponse {
  readonly version?: unknown;
}

@injectable()
export class HttpApplicationVersionAdapter implements ApplicationVersionPort {
  async loadApplicationVersion(): Promise<string> {
    const response = await fetch(new URL('/api/version', `${API_URL}/`));

    if (!response.ok) {
      throw new Error(`Failed to load application version (${response.status})`);
    }

    const payload = (await response.json()) as ApplicationVersionResponse;

    return typeof payload.version === 'string' ? payload.version.trim() : '';
  }
}
