import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import {
  ToastViewport,
  type ToastVariant,
  type Toast,
} from "../../../shared/ui/components/ToastViewport";

export type { ToastVariant };

interface QueueToast {
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface NotificationContextValue {
  pushToast: (toast: QueueToast) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ message, variant = "info", duration = 4000 }: QueueToast) => {
      const safeDuration = Math.max(duration, 1500);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((previous) => [
        ...previous,
        { id, message, variant, duration: safeDuration },
      ]);

      setTimeout(() => removeToast(id), safeDuration);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ pushToast, removeToast }),
    [pushToast, removeToast]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToastLayer toasts={toasts} onDismiss={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationToastLayerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function NotificationToastLayer({
  toasts,
  onDismiss,
}: NotificationToastLayerProps) {
  const { t } = useTranslation();

  if (toasts.length === 0) {
    return null;
  }

  const labelByVariant: Record<ToastVariant, string> = {
    info: t("notifications.labels.info", "Heads up"),
    success: t("notifications.labels.success", "Mission accomplished"),
    error: t("notifications.labels.error", "System error"),
  };

  return (
    <ToastViewport
      toasts={toasts}
      onDismiss={onDismiss}
      dismissLabel={t("common.dismiss", "Dismiss notification")}
      labelByVariant={labelByVariant}
    />
  );
}
