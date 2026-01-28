import { createContext, type PropsWithChildren, useContext } from 'react';
import type { FormPort } from '../../../application/shared/contracts/form.port';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

const FormContext = createContext<FormPort | null>(null);

interface PresentationFormProviderProps extends PropsWithChildren {
  readonly value: FormPort;
}

export function PresentationFormProvider({ children, value }: PresentationFormProviderProps) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function usePresentationFormPort(): FormPort {
  const port = useContext(FormContext);

  if (!port) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_FORM_PROVIDER_REQUIRED);
  }

  return port;
}
