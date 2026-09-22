import { createContext, type PropsWithChildren, useContext } from 'react';
import type { CaptchaWidgetPort } from '../../../application/identity/ports/captcha-widget.port';
import { PresentationRuntimeDependencyProviderRequiredError } from '../../../domains/shared/errors/presentation-context-error-code';

const CaptchaContext = createContext<CaptchaWidgetPort | null>(null);

export function CaptchaProvider({ children, value }: PropsWithChildren<{ readonly value: CaptchaWidgetPort }>) {
  return <CaptchaContext.Provider value={value}>{children}</CaptchaContext.Provider>;
}

export function useCaptchaWidget(): CaptchaWidgetPort {
  const value = useContext(CaptchaContext);
  if (!value) {
    throw new PresentationRuntimeDependencyProviderRequiredError({
      consumer: 'useCaptchaWidget',
      contextName: 'CaptchaContext',
    });
  }
  return value;
}
