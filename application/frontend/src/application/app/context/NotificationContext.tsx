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

const TOAST_BASE_CLASSES =
  "pointer-events-auto overflow-hidden rounded-3xl border px-5 py-4 backdrop-blur-xl transition-transform duration-300 animate-slide-down hover:translate-y-[-2px]";

const TOAST_VIEWPORT_CLASSES =
  "pointer-events-none fixed top-6 right-6 z-[1200] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-4";
const TOAST_CONTENT_CLASSES = "flex items-start gap-4";
const TOAST_ICON_WRAPPER_BASE_CLASSES =
  "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border bg-light-100 text-base font-bold uppercase tracking-widest text-dark-500 shadow-glow dark:border-light-500/20 dark:bg-dark-500/70 dark:text-light-50";
const TOAST_TEXT_STACK_CLASSES = "flex-1";
const TOAST_VARIANT_LABEL_CLASSES =
  "text-xs font-bold uppercase tracking-[0.2em] text-dark-300 dark:text-light-400";
const TOAST_MESSAGE_CLASSES =
  "mt-1 text-sm font-semibold leading-snug text-dark-500 dark:text-light-100";
const TOAST_DISMISS_BUTTON_CLASSES =
  "ml-2 rounded-full border border-primary-500/20 p-1 text-[0.7rem] text-dark-300 transition-colors hover:bg-primary-500/10 hover:text-dark-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-light-100 dark:border-light-500/20 dark:text-light-400 dark:hover:bg-light-500/10 dark:hover:text-light-100 dark:focus-visible:ring-offset-dark-500";
const TOAST_PROGRESS_TRACK_CLASSES =
  "mt-4 h-1 overflow-hidden rounded-full bg-light-200/80 dark:bg-dark-400/70";
const TOAST_PROGRESS_FILL_CLASSES =
  "h-full rounded-full bg-gradient-to-r from-secondary-400 via-accent-500 to-primary-400";

const TOAST_INFO_CLASSES = `${TOAST_BASE_CLASSES} border-primary-500/25 bg-light-50/95 text-dark-500 shadow-neon dark:border-primary-400/60 dark:bg-gradient-to-br dark:from-dark-500/90 dark:via-primary-500/20 dark:to-dark-400/90 dark:text-light-50`;
const TOAST_SUCCESS_CLASSES = `${TOAST_BASE_CLASSES} border-success-500/25 bg-light-50/95 text-dark-500 shadow-neon-accent dark:border-success-400/60 dark:bg-gradient-to-br dark:from-dark-500/90 dark:via-success-500/20 dark:to-dark-400/90 dark:text-success-100`;
const TOAST_ERROR_CLASSES = `${TOAST_BASE_CLASSES} border-danger-500/25 bg-light-50/95 text-dark-500 shadow-neon-secondary dark:border-danger-400/60 dark:bg-gradient-to-br dark:from-dark-500/90 dark:via-danger-500/20 dark:to-dark-400/90 dark:text-danger-100`;

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
    <div
      className={TOAST_VIEWPORT_CLASSES}
      data-toast-viewport="true"
      role="region"
      aria-live="polite"
    >
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

  const variantClasses: Record<ToastVariant, string> = {
    info: TOAST_INFO_CLASSES,
    success: TOAST_SUCCESS_CLASSES,
    error: TOAST_ERROR_CLASSES,
  };

  const iconWrapperClassesByVariant: Record<ToastVariant, string> = {
    info: `${TOAST_ICON_WRAPPER_BASE_CLASSES} border-primary-500/20`,
    success: `${TOAST_ICON_WRAPPER_BASE_CLASSES} border-success-500/20`,
    error: `${TOAST_ICON_WRAPPER_BASE_CLASSES} border-danger-500/20`,
  };

  return (
    <div
      role={role}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={variantClasses[toast.variant]}
      data-toast-card={toast.variant}
    >
      <div className={TOAST_CONTENT_CLASSES}>
        <div className={iconWrapperClassesByVariant[toast.variant]}>
          <span aria-hidden>{iconByVariant[toast.variant]}</span>
        </div>
        <div className={TOAST_TEXT_STACK_CLASSES}>
          <p className={TOAST_VARIANT_LABEL_CLASSES}>{variantLabel}</p>
          <p className={TOAST_MESSAGE_CLASSES}>{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={TOAST_DISMISS_BUTTON_CLASSES}
          aria-label={dismissLabel}
        >
          ✕
        </button>
      </div>
      <div className={TOAST_PROGRESS_TRACK_CLASSES} aria-hidden>
        <div
          className={TOAST_PROGRESS_FILL_CLASSES}
          style={{
            width: progressWidth,
            transition: `width ${toastDuration}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
