import type { PropsWithChildren } from 'react';
import { StrictMode, Suspense } from 'react';
import { TanstackFormAdapter } from '../../infrastructure/forms/tanstack-form.adapter';
import { useReactI18nextTranslationAdapter } from '../../infrastructure/i18n/react-i18next-translation.adapter';
import { ReactRouterRoutingAdapter } from '../../infrastructure/routing/react-router-routing.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { MantineUiAdapter } from '../../infrastructure/ui/mantine-ui.adapter';
import { RuntimeDependencyProvider } from '../../presentation/shared/di/use-runtime-dependency';
import { PresentationFormProvider } from '../../presentation/shared/forms/form-provider';
import { PresentationTranslationProvider } from '../../presentation/shared/i18n/use-presentation-translation';
import { PresentationRoutingProvider } from '../../presentation/shared/routing/router';
import { PresentationUiProvider, PresentationUiRoot } from '../../presentation/shared/ui/provider';
import { runtimeContainer } from '../composition/runtime-container';
import { AppAuthProvider } from '../identity/app-auth-provider';

const routingPort = new ReactRouterRoutingAdapter().createPort();
const formPort = new TanstackFormAdapter().createPort();
const uiPort = new MantineUiAdapter().createPort();
const storagePort = runtimeContainer.get(LocalStorageAdapter);
const resolveRuntimeDependency = <T,>(
  serviceIdentifier: Parameters<typeof runtimeContainer.get<T>>[0],
) => runtimeContainer.get(serviceIdentifier);

export function AppProviders({ children }: PropsWithChildren) {
  const translationPort = useReactI18nextTranslationAdapter(storagePort);

  return (
    <StrictMode>
      <Suspense fallback={null}>
        <PresentationUiProvider value={uiPort}>
          <PresentationUiRoot>
            <PresentationTranslationProvider value={translationPort}>
              <PresentationRoutingProvider value={routingPort}>
                <RuntimeDependencyProvider value={resolveRuntimeDependency}>
                  <PresentationFormProvider value={formPort}>
                    <AppAuthProvider>{children}</AppAuthProvider>
                  </PresentationFormProvider>
                </RuntimeDependencyProvider>
              </PresentationRoutingProvider>
            </PresentationTranslationProvider>
          </PresentationUiRoot>
        </PresentationUiProvider>
      </Suspense>
    </StrictMode>
  );
}
