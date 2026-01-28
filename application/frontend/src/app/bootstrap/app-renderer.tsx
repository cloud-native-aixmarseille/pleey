import { createRoot } from 'react-dom/client';
import { AppBootstrapErrorCode } from '../../domains/shared/errors/app-bootstrap-error-code';
import { AppRouter } from '../routing/app-router';
import { AppProviders } from './app-providers';

export class AppRenderer {
  render() {
    const element = document.getElementById('root');

    if (!element) {
      throw new Error(AppBootstrapErrorCode.ROOT_ELEMENT_NOT_FOUND);
    }

    createRoot(element).render(
      <AppProviders>
        <AppRouter />
      </AppProviders>,
    );
  }
}
