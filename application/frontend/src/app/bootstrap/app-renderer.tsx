import { createRoot } from 'react-dom/client';
import { AppBootstrapErrorCode } from '../../domains/shared/errors/app-bootstrap-error-code';
import { AppRouter } from '../routing/app-router';
import { createAppProviderFactories } from './app-provider-factory';
import { AppProviders } from './app-providers';
import { createAppContainer } from './create-app-container';
import { createAppRouter } from './modules/routing/container';

export class AppRenderer {
  render() {
    const element = document.getElementById('root');

    if (!element) {
      throw new Error(AppBootstrapErrorCode.ROOT_ELEMENT_NOT_FOUND);
    }

    const container = createAppContainer();
    const providerFactories = createAppProviderFactories(container);
    const router = createAppRouter(container);

    createRoot(element).render(
      <AppProviders providerFactories={providerFactories}>
        <AppRouter router={router} />
      </AppProviders>,
    );
  }
}
