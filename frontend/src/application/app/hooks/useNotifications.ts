import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Centralized notification helpers.
 * Currently backed by window.alert to keep UX consistent while
 * allowing future swap for a richer notification system.
 */
export function useNotifications() {
  const { t } = useTranslation();

  const notify = useCallback(
    (messageKey: string) => {
      if (typeof window === 'undefined') {
        return;
      }

      window.alert(t(messageKey));
    },
    [t],
  );

  const notifyFromError = useCallback(
    (error: unknown, fallbackKey: string) => {
      if (error instanceof Error && error.message) {
        notify(error.message);
        return;
      }

      notify(fallbackKey);
    },
    [notify],
  );

  return {
    notify,
    notifyFromError,
  };
}
