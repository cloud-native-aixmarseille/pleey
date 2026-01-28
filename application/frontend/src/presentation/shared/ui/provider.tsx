import { createContext, type PropsWithChildren, useContext } from 'react';
import type {
  PresentationUiThemeState,
  UiPort,
} from '../../../application/shared/contracts/ui.port';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

const UiContext = createContext<UiPort | null>(null);

interface PresentationUiProviderProps extends PropsWithChildren {
  readonly value: UiPort;
}

export function PresentationUiProvider({ children, value }: PresentationUiProviderProps) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

function usePresentationUiPort(): UiPort {
  const port = useContext(UiContext);

  if (!port) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_UI_PROVIDER_REQUIRED);
  }

  return port;
}

export function usePresentationThemeState(): PresentationUiThemeState {
  return usePresentationUiPort().useThemeState();
}

export function PresentationUiRoot({ children }: PropsWithChildren) {
  const { Provider } = usePresentationUiPort();

  return <Provider>{children}</Provider>;
}
