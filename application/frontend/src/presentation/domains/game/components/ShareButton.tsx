import { useState, useEffect, useRef, useId, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  DangerButton,
  PrimaryButton,
  SecondaryButton,
} from "../../../../presentation/shared/ui/components";

const SHARE_BUTTON_WRAPPER_CLASSES = "relative";

const SHARE_BACKDROP_CLASSES =
  "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in";
const SHARE_DIALOG_POSITIONER_CLASSES =
  "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4 animate-scale-in";
const SHARE_DIALOG_CONTENT_CLASSES = "flex flex-col gap-6";
const SHARE_DIALOG_HEADER_CLASSES = "flex items-center justify-between";
const SHARE_DIALOG_TITLE_CLASSES =
  "font-display text-2xl font-bold uppercase text-light-100";

const SHARE_OPTIONS_LIST_CLASSES = "space-y-3";

const SHARE_ERROR_TEXT_CLASSES = "mt-4 text-sm font-medium text-danger-400";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
}

export function ShareButton({
  title,
  text,
  url,
  variant = "secondary",
  size = "lg",
}: ShareButtonProps) {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const shareDialogTitleId = useId();
  const resolvedUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");
  const closeShareMenu = useCallback(() => {
    setShowShareMenu(false);
    setShareError(null);
    shareButtonRef.current?.focus();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showShareMenu) {
        closeShareMenu();
      }
    };

    if (showShareMenu) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [closeShareMenu, showShareMenu]);

  // Focus trap in modal
  useEffect(() => {
    if (!showShareMenu || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => modal.removeEventListener("keydown", handleTab);
  }, [showShareMenu]);

  // Handle native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: resolvedUrl,
        });
        setShareError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setShareError(null);
          return;
        }

        setShareError(t("game.share.errors.nativeShareFailed"));
        setShowShareMenu(true);
      }
    } else {
      // Fallback to custom share menu
      setShareError(null);
      setShowShareMenu(true);
    }
  };

  // Share to specific platforms
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(resolvedUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    closeShareMenu();
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      resolvedUrl
    )}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
    closeShareMenu();
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      resolvedUrl
    )}`;
    window.open(linkedInUrl, "_blank", "width=550,height=420");
    closeShareMenu();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${resolvedUrl}`);
      setCopied(true);
      setShareError(null);
      setTimeout(() => {
        setCopied(false);
        closeShareMenu();
      }, 2000);
    } catch (err) {
      const messageKey =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "game.share.errors.copyPermissionDenied"
          : "game.share.errors.copyFailed";

      setShareError(t(messageKey));
      setCopied(false);
    }
  };

  return (
    <div className={SHARE_BUTTON_WRAPPER_CLASSES} data-share-button="true">
      {variant === "primary" ? (
        <PrimaryButton
          ref={shareButtonRef}
          size={size}
          onClick={handleNativeShare}
          aria-haspopup="dialog"
          aria-expanded={showShareMenu}
          icon={{ name: "Share2" }}
        >
          {t("game.share.buttonLabel")}
        </PrimaryButton>
      ) : variant === "secondary" ? (
        <SecondaryButton
          ref={shareButtonRef}
          size={size}
          onClick={handleNativeShare}
          aria-haspopup="dialog"
          aria-expanded={showShareMenu}
          icon={{ name: "Share2" }}
        >
          {t("game.share.buttonLabel")}
        </SecondaryButton>
      ) : (
        <DangerButton
          ref={shareButtonRef}
          size={size}
          onClick={handleNativeShare}
          aria-haspopup="dialog"
          aria-expanded={showShareMenu}
          icon={{ name: "Share2" }}
        >
          {t("game.share.buttonLabel")}
        </DangerButton>
      )}

      {/* Custom Share Menu (fallback for browsers without Web Share API) */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div
            className={SHARE_BACKDROP_CLASSES}
            role="button"
            tabIndex={0}
            aria-label={t("game.share.backdropLabel")}
            onClick={closeShareMenu}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                closeShareMenu();
              }
            }}
          />

          {/* Share Menu */}
          <div
            ref={modalRef}
            className={SHARE_DIALOG_POSITIONER_CLASSES}
            role="dialog"
            aria-modal="true"
            aria-labelledby={shareDialogTitleId}
          >
            <Card
              surface="glass"
              variant="primary"
              padding="xl"
              border="regular"
              elevation="glow"
            >
              <div className={SHARE_DIALOG_CONTENT_CLASSES}>
                <div className={SHARE_DIALOG_HEADER_CLASSES}>
                  <h3
                    id={shareDialogTitleId}
                    className={SHARE_DIALOG_TITLE_CLASSES}
                  >
                    {t("game.share.dialogTitle")}
                  </h3>
                  <SecondaryButton
                    type="button"
                    onClick={closeShareMenu}
                    effect="flat"
                    size="sm"
                    aria-label={t("game.share.closeLabel")}
                  >
                    ×
                  </SecondaryButton>
                </div>

                <div className={SHARE_OPTIONS_LIST_CLASSES}>
                  <SecondaryButton
                    type="button"
                    onClick={shareToTwitter}
                    effect="flat"
                    size="sm"
                    alignment="start"
                    fullWidth
                    icon={{ name: "X" }}
                  >
                    {t("game.share.options.twitter")}
                  </SecondaryButton>

                  <SecondaryButton
                    type="button"
                    onClick={shareToFacebook}
                    effect="flat"
                    size="sm"
                    alignment="start"
                    fullWidth
                    icon={{ name: "Facebook" }}
                  >
                    {t("game.share.options.facebook")}
                  </SecondaryButton>

                  <SecondaryButton
                    type="button"
                    onClick={shareToLinkedIn}
                    effect="flat"
                    size="sm"
                    alignment="start"
                    fullWidth
                    icon={{ name: "Linkedin" }}
                  >
                    {t("game.share.options.linkedin")}
                  </SecondaryButton>

                  <SecondaryButton
                    type="button"
                    onClick={copyToClipboard}
                    effect="flat"
                    size="sm"
                    alignment="start"
                    fullWidth
                    icon={{ name: "Clipboard" }}
                  >
                    {copied
                      ? t("game.share.copySuccess")
                      : t("game.share.copyLink")}
                  </SecondaryButton>
                </div>

                {shareError && (
                  <p
                    className={SHARE_ERROR_TEXT_CLASSES}
                    role="alert"
                    aria-live="assertive"
                  >
                    {shareError}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
