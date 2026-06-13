import { useEffectEvent, useState } from 'react';
import { resolvePresentationErrorMessage } from '../../errors/resolve-presentation-error-message';
import { useOptionalPresentationToast } from './presentation-toast';

type PresentationToastTone = 'error' | 'info' | 'success' | 'warning';

interface PresentationNotificationOptions {
  readonly durationMs?: number;
  readonly id?: string;
}

interface PresentationHandleErrorOptions extends PresentationNotificationOptions {
  readonly fallbackMessage: string;
  readonly notify?: boolean;
}

interface PresentationFeedbackChannel {
  readonly clearError: () => void;
  readonly errorMessage: string | null;
  readonly handleError: (error: unknown, options: PresentationHandleErrorOptions) => string;
  readonly notify: (
    tone: PresentationToastTone,
    message: string,
    options?: PresentationNotificationOptions,
  ) => void;
  readonly setErrorMessage: (message: string | null) => void;
}

export function usePresentationFeedbackChannel(): PresentationFeedbackChannel {
  const toast = useOptionalPresentationToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useEffectEvent(() => {
    setErrorMessage(null);
  });

  const assignErrorMessage = useEffectEvent((message: string | null) => {
    setErrorMessage(message);
  });

  const notify = useEffectEvent(
    (
      tone: PresentationToastTone,
      message: string,
      options: PresentationNotificationOptions = {},
    ) => {
      if (!toast) {
        return;
      }

      toast[tone]({
        durationMs: options.durationMs,
        id: options.id,
        message,
      });
    },
  );

  const handleError = useEffectEvent(
    (error: unknown, options: PresentationHandleErrorOptions): string => {
      const message = resolvePresentationErrorMessage(error, options.fallbackMessage);

      setErrorMessage(message);

      if (options.notify) {
        notify('error', message, {
          durationMs: options.durationMs,
          id: options.id,
        });
      }

      return message;
    },
  );

  return {
    clearError,
    errorMessage,
    handleError,
    notify,
    setErrorMessage: assignErrorMessage,
  };
}
