import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { createStyles } from "../../../shared/ui/styles";

const TOAST_BASE_CLASSES =
  "pointer-events-auto overflow-hidden rounded-3xl border px-5 py-4 backdrop-blur-xl transition-transform duration-300 animate-slide-down hover:translate-y-[-2px]";

const styles = createStyles("NotificationContext", {
  slot1:
    "pointer-events-none fixed top-6 right-6 z-[1200] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-4",
  slot2: "flex items-start gap-4",
  slot3:
    "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-light-500/20 bg-dark-500/70 text-base font-bold uppercase tracking-widest text-light-50 shadow-glow",
  slot4: "flex-1",
  slot5: "text-xs font-bold uppercase tracking-[0.2em] text-light-400",
  slot6: "mt-1 text-sm font-semibold leading-snug text-light-100",
  slot7:
    "ml-2 rounded-full border border-light-500/20 p-1 text-[0.7rem] text-light-400 transition-colors hover:bg-light-500/10 hover:text-light-100",
  slot8: "mt-4 h-1 overflow-hidden rounded-full bg-dark-400/70",
  slot9:
    "h-full rounded-full bg-gradient-to-r from-secondary-400 via-accent-500 to-primary-400",
  toastInfo: `${TOAST_BASE_CLASSES} border-primary-400/60 bg-gradient-to-br from-dark-500/90 via-primary-500/20 to-dark-400/90 text-light-50 shadow-neon`,
  toastSuccess: `${TOAST_BASE_CLASSES} border-success-400/60 bg-gradient-to-br from-dark-500/90 via-success-500/20 to-dark-400/90 text-success-100 shadow-neon-accent`,
  toastError: `${TOAST_BASE_CLASSES} border-danger-400/60 bg-gradient-to-br from-dark-500/90 via-danger-500/20 to-dark-400/90 text-danger-100 shadow-neon-secondary`,
});

export type ToastVariant = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

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
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
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

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
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
    <div {...styles.slot1}>
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          dismissLabel={t("common.dismiss", "Dismiss notification")}
          variantLabel={labelByVariant[toast.variant]}
        />
      ))}
    </div>
  );
}

interface ToastCardProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  dismissLabel: string;
  variantLabel: string;
}

function ToastCard({
  toast,
  onDismiss,
  dismissLabel,
  variantLabel,
}: ToastCardProps) {
  const [progressWidth, setProgressWidth] = useState("100%");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgressWidth("0%"));
    return () => cancelAnimationFrame(frame);
  }, []);

  const role = toast.variant === "error" ? "alert" : "status";
  const toastDuration = toast.duration ?? 4000;

  const iconByVariant: Record<ToastVariant, string> = {
    info: "⚡",
    success: "✦",
    error: "⚠",
  };

  const variantStyles: Record<ToastVariant, typeof styles.toastInfo> = {
    info: styles.toastInfo,
    success: styles.toastSuccess,
    error: styles.toastError,
  };

  return (
    <div
      role={role}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      {...variantStyles[toast.variant]}
    >
      <div {...styles.slot2}>
        <div {...styles.slot3}>
          <span aria-hidden>{iconByVariant[toast.variant]}</span>
        </div>
        <div {...styles.slot4}>
          <p {...styles.slot5}>{variantLabel}</p>
          <p {...styles.slot6}>{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          {...styles.slot7}
          aria-label={dismissLabel}
        >
          ✕
        </button>
      </div>
      <div {...styles.slot8} aria-hidden>
        <div
          {...styles.slot9}
          style={{
            width: progressWidth,
            transition: `width ${toastDuration}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
