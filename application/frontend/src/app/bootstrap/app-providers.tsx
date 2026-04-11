import { type PropsWithChildren, StrictMode, Suspense } from 'react';
import type { AppProviderFactory } from './app-provider-factory';
import { composeAppProviders } from './app-provider-factory';

interface AppProvidersProps extends PropsWithChildren {
  readonly providerFactories: readonly AppProviderFactory[];
}

export function AppProviders({ children, providerFactories }: AppProvidersProps) {
  return (
    <StrictMode>
      <Suspense fallback={null}>{composeAppProviders(children, providerFactories)}</Suspense>
    </StrictMode>
  );
}
