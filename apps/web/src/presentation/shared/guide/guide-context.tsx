import { createContext, createElement, type ReactNode, useContext } from 'react';
import type { GuideTourFacade } from '../../../application/guide/facades/guide-tour.facade';
import { PresentationRuntimeDependencyProviderRequiredError } from '../../../domains/shared/errors/presentation-context-error-code';

const GuideContext = createContext<GuideTourFacade | null>(null);
export function provideGuide(children: ReactNode, value: GuideTourFacade) {
  return createElement(GuideContext.Provider, { value }, children);
}
export function useGuide(): GuideTourFacade {
  const guide = useContext(GuideContext);
  if (!guide)
    throw new PresentationRuntimeDependencyProviderRequiredError({ consumer: 'useGuide', contextName: 'GuideContext' });
  return guide;
}
