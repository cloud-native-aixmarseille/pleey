import { createContext, createElement, type ReactNode, useContext } from 'react';
import type { MediaAccessPort } from '../../../domains/media/ports/media-access.port';
import { PresentationRuntimeDependencyProviderRequiredError } from '../../../domains/shared/errors/presentation-context-error-code';

const MediaAccessContext = createContext<MediaAccessPort | null>(null);

export function provideMediaAccess(children: ReactNode, value: MediaAccessPort) {
  return createElement(MediaAccessContext.Provider, { value }, children);
}

export function useMediaAccess(): MediaAccessPort {
  const access = useContext(MediaAccessContext);
  if (!access)
    throw new PresentationRuntimeDependencyProviderRequiredError({
      consumer: 'useMediaAccess',
      contextName: 'MediaAccessContext',
    });
  return access;
}
