import { createContext, type PropsWithChildren, useContext } from 'react';
import type { TranslationPort } from '../../../application/shared/contracts/translation.port';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

const TranslationContext = createContext<TranslationPort | null>(null);

interface PresentationTranslationProviderProps extends PropsWithChildren {
  readonly value: TranslationPort;
}

export function PresentationTranslationProvider({
  children,
  value,
}: PresentationTranslationProviderProps) {
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function usePresentationTranslation(): TranslationPort {
  const port = useContext(TranslationContext);

  if (!port) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_TRANSLATION_PROVIDER_REQUIRED);
  }

  return port;
}
