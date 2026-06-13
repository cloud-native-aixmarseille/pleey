import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PresentationContextErrorCode } from '../../../../domains/shared/errors/presentation-context-error-code';
import { uiThemeTokens } from '../foundation/ui-theme';
import { StatusBanner } from './status-banner';

type PresentationToastTone = 'error' | 'info' | 'success' | 'warning';

interface PresentationToastOptions {
  readonly durationMs?: number;
  readonly id?: string;
  readonly message: string;
}

interface PresentationToastEntry extends Required<PresentationToastOptions> {
  readonly tone: PresentationToastTone;
}

interface PresentationToastApi {
  readonly dismiss: (id: string) => void;
  readonly error: (options: PresentationToastOptions) => void;
  readonly info: (options: PresentationToastOptions) => void;
  readonly success: (options: PresentationToastOptions) => void;
  readonly warning: (options: PresentationToastOptions) => void;
}

const DEFAULT_TOAST_DURATION_MS = 4000;

const toastViewportStyle = {
  display: 'grid',
  gap: 'var(--mantine-spacing-sm)',
  maxWidth: '24rem',
  pointerEvents: 'none',
  position: 'fixed',
  right: 'var(--mantine-spacing-lg)',
  top: 'var(--mantine-spacing-lg)',
  width: 'calc(100vw - (2 * var(--mantine-spacing-lg)))',
  zIndex: 400,
} as const;

const toastItemStyle = {
  background: uiThemeTokens.color.surface.canvas,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.elevated,
  overflow: 'hidden',
  pointerEvents: 'auto',
} as const;

const PresentationToastContext = createContext<{
  readonly api: PresentationToastApi;
  readonly entries: readonly PresentationToastEntry[];
} | null>(null);

export function PresentationToastProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<readonly PresentationToastEntry[]>([]);

  const dismiss = (id: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
  };

  const push = (tone: PresentationToastTone, options: PresentationToastOptions) => {
    const id = options.id ?? `${tone}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    const nextEntry: PresentationToastEntry = {
      durationMs: options.durationMs ?? DEFAULT_TOAST_DURATION_MS,
      id,
      message: options.message,
      tone,
    };

    setEntries((currentEntries) => {
      const entriesWithoutTarget = currentEntries.filter((entry) => entry.id !== id);
      return [...entriesWithoutTarget, nextEntry];
    });
  };

  const api = useMemo<PresentationToastApi>(
    () => ({
      dismiss,
      error: (options) => push('error', options),
      info: (options) => push('info', options),
      success: (options) => push('success', options),
      warning: (options) => push('warning', options),
    }),
    [],
  );

  const contextValue = useMemo(
    () => ({
      api,
      entries,
    }),
    [api, entries],
  );

  return (
    <PresentationToastContext.Provider value={contextValue}>
      {children}
    </PresentationToastContext.Provider>
  );
}

export function usePresentationToast(): PresentationToastApi {
  const context = useContext(PresentationToastContext);

  if (!context) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_TOAST_PROVIDER_REQUIRED);
  }

  return context.api;
}

export function useOptionalPresentationToast(): PresentationToastApi | null {
  const context = useContext(PresentationToastContext);
  return context?.api ?? null;
}

export function PresentationToastViewport() {
  const context = useContext(PresentationToastContext);

  if (!context) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_TOAST_PROVIDER_REQUIRED);
  }

  if (context.entries.length === 0) {
    return null;
  }

  return (
    <div style={toastViewportStyle}>
      {context.entries.map((entry) => (
        <PresentationToastItem entry={entry} key={entry.id} onDismiss={context.api.dismiss} />
      ))}
    </div>
  );
}

function PresentationToastItem({
  entry,
  onDismiss,
}: {
  readonly entry: PresentationToastEntry;
  readonly onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (entry.durationMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss(entry.id);
    }, entry.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [entry.durationMs, entry.id, onDismiss]);

  return (
    <div data-testid={entry.id} style={toastItemStyle}>
      <StatusBanner tone={entry.tone}>{entry.message}</StatusBanner>
    </div>
  );
}
