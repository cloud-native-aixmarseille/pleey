import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useNotificationContext,
  ToastVariant,
} from "../context/NotificationContext";

/**
 * Centralized notification helpers backed by the toast system.
 */
export function useNotifications() {
  const { t } = useTranslation();
  const { pushToast } = useNotificationContext();

  const notify = useCallback(
    (messageKey: string, variant: ToastVariant = "info") => {
      pushToast({
        message: t(messageKey, { defaultValue: messageKey }),
        variant,
      });
    },
    [pushToast, t],
  );

  const notifyFromError = useCallback(
    (error: unknown, fallbackKey: string) => {
      if (error instanceof Error && error.message) {
        pushToast({
          message: t(error.message, { defaultValue: error.message }),
          variant: "error",
        });
        return;
      }

      notify(fallbackKey, "error");
    },
    [notify, pushToast, t],
  );

  return {
    notify,
    notifyFromError,
  };
}
