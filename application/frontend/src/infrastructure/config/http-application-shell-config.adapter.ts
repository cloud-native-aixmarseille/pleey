import { injectable } from 'inversify';
import type {
  ApplicationShellConfig,
  ApplicationShellConfigPort,
} from '../../application/shared/ports/application-shell-config.port';
import { API_URL, FEEDBACK_URL } from './api';

interface ApplicationVersionResponse {
  readonly version?: unknown;
}

@injectable()
export class HttpApplicationShellConfigAdapter implements ApplicationShellConfigPort {
  async loadApplicationShellConfig(): Promise<ApplicationShellConfig> {
    const appVersion = await this.loadApplicationVersion();

    return {
      appVersion,
      feedbackUrl: FEEDBACK_URL,
    };
  }

  private async loadApplicationVersion(): Promise<string> {
    try {
      const response = await fetch(new URL('/api/version', `${API_URL}/`));

      if (!response.ok) {
        return '';
      }

      const payload = (await response.json()) as ApplicationVersionResponse;

      return typeof payload.version === 'string' ? payload.version.trim() : '';
    } catch {
      return '';
    }
  }
}
