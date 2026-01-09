import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { useTranslation } from "react-i18next";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  title,
  description,
  titleClassName,
  descriptionClassName,
  contentClassName,
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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement;

    const node = dialogRef.current;
    if (node) {
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const firstFocusable = focusable[0];
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        node.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
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
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== overlayRef.current) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };

  const closeLabel = t("common.close", "Close dialog");

  const portalTarget =
    document.querySelector("[data-arcade-theme]") ?? document.body;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-dark-900/50 backdrop-blur-md px-4 py-6 dark:bg-dark-900/70"
      role="button"
      tabIndex={0}
      aria-label={closeLabel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-2xl animate-scale-in rounded-lg border border-primary-500/30 bg-light-50/95 p-8 text-dark-500 shadow-neon backdrop-blur-xl dark:border-primary-500/40 dark:bg-dark-500/90 dark:text-light-100"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className={`text-2xl font-black uppercase tracking-[0.3em] text-primary-900 dark:text-primary-200 ${
                titleClassName ?? ""
              }`}
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className={`mt-2 max-w-xl text-sm font-medium text-dark-400 dark:text-light-300 ${
                  descriptionClassName ?? ""
                }`}
              >
                {description}
              </p>
            ) : null}
          </div>
          <SecondaryButton
            type="button"
            onClick={onClose}
            effect="flat"
            size="sm"
            aria-label={closeLabel}
          >
            ✕
          </SecondaryButton>
        </div>

        <div
          className={`mt-6 max-h-[60vh] overflow-y-auto pr-2 text-dark-500 dark:text-light-100 ${
            contentClassName ?? ""
          }`}
        >
          {children}
        </div>

        {footer ? (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    portalTarget
  );
}

export default Modal;
