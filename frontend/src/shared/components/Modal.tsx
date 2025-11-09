import { ReactNode, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Neon-styled modal dialog compatible with the Cyber Arcade design system.
 * Handles focus trapping, escape/overlay dismissal, and portal rendering.
 */
export default function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
}: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement;

    const node = dialogRef.current;
    if (node) {
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const firstFocusable = focusable[0];
      (firstFocusable ?? node).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        node?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault();
        (node as HTMLElement | null)?.focus();
        return;
      }

      const focusable = Array.from(focusableElements);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      const previouslyFocused = previouslyFocusedElementRef.current;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-dark-900/70 backdrop-blur-md px-4 py-6"
      role="button"
      tabIndex={0}
      aria-label={t("common.close", "Close dialog")}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-2xl animate-scale-in rounded-[2.5rem] border border-primary-500/40 bg-dark-500/90 p-8 shadow-neon backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="text-2xl font-black uppercase tracking-[0.3em] text-primary-200"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-2 max-w-xl text-sm font-medium text-light-300"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-primary-400/40 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-light-300 transition hover:bg-primary-500/20 hover:text-light-100"
            aria-label={t("common.close", "Close dialog")}
          >
            ✕
          </button>
        </div>

        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 text-light-100">
          {children}
        </div>

        {footer ? (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
