import { useState, useEffect, useRef, useId, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card } from "../../../shared/components";
import { composeClasses } from "../../../shared/ui/utils/composeClasses";

const SHARE_BUTTON_WRAPPER_CLASSES = "relative";
const SHARE_BUTTON_CONTENT_CLASSES = "flex items-center justify-center gap-2";
const SHARE_BUTTON_ICON_CLASSES = "h-5 w-5";

const SHARE_BACKDROP_CLASSES =
  "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in";
const SHARE_DIALOG_POSITIONER_CLASSES =
  "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4 animate-scale-in";
const SHARE_DIALOG_CONTENT_CLASSES = "flex flex-col gap-6";
const SHARE_DIALOG_HEADER_CLASSES = "flex items-center justify-between";
const SHARE_DIALOG_TITLE_CLASSES =
  "font-display text-2xl font-bold uppercase text-light-100";
const SHARE_DIALOG_CLOSE_BUTTON_CLASSES =
  "text-3xl leading-none text-light-200 transition-colors hover:text-danger-400";

const SHARE_OPTIONS_LIST_CLASSES = "space-y-3";
const SHARE_OPTION_BASE_CLASSES =
  "flex w-full items-center gap-4 rounded-lg p-4 transition-transform hover:scale-105 retro-shadow";
const SHARE_OPTION_TWITTER_CLASSES = composeClasses(
  SHARE_OPTION_BASE_CLASSES,
  "bg-gradient-to-r from-[#1DA1F2] to-[#0d8bd9] text-white"
);
const SHARE_OPTION_FACEBOOK_CLASSES = composeClasses(
  SHARE_OPTION_BASE_CLASSES,
  "bg-gradient-to-r from-[#1877F2] to-[#0d5fbf] text-white"
);
const SHARE_OPTION_LINKEDIN_CLASSES = composeClasses(
  SHARE_OPTION_BASE_CLASSES,
  "bg-gradient-to-r from-[#0077B5] to-[#005582] text-white"
);
const SHARE_OPTION_COPY_CLASSES = composeClasses(
  SHARE_OPTION_BASE_CLASSES,
  "bg-gradient-to-r from-accent-500 to-accent-600 text-dark-900"
);

const SHARE_OPTION_ICON_CLASSES = "h-6 w-6";
const SHARE_OPTION_LABEL_CLASSES = "font-body font-bold";
const SHARE_ERROR_TEXT_CLASSES = "mt-4 text-sm font-medium text-danger-400";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

export function ShareButton({
  title,
  text,
  url,
  variant = "outline",
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
      <Button
        ref={shareButtonRef}
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        aria-haspopup="dialog"
        aria-expanded={showShareMenu}
      >
        <span className={SHARE_BUTTON_CONTENT_CLASSES}>
          <svg
            className={SHARE_BUTTON_ICON_CLASSES}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>{t("game.share.buttonLabel")}</span>
        </span>
      </Button>

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
              tone="primary"
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
                  <button
                    onClick={closeShareMenu}
                    className={SHARE_DIALOG_CLOSE_BUTTON_CLASSES}
                    aria-label={t("game.share.closeLabel")}
                  >
                    ×
                  </button>
                </div>

                <div className={SHARE_OPTIONS_LIST_CLASSES}>
                  <button
                    onClick={shareToTwitter}
                    className={SHARE_OPTION_TWITTER_CLASSES}
                  >
                    <svg
                      className={SHARE_OPTION_ICON_CLASSES}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span className={SHARE_OPTION_LABEL_CLASSES}>
                      {t("game.share.options.twitter")}
                    </span>
                  </button>

                  <button
                    onClick={shareToFacebook}
                    className={SHARE_OPTION_FACEBOOK_CLASSES}
                  >
                    <svg
                      className={SHARE_OPTION_ICON_CLASSES}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className={SHARE_OPTION_LABEL_CLASSES}>
                      {t("game.share.options.facebook")}
                    </span>
                  </button>

                  <button
                    onClick={shareToLinkedIn}
                    className={SHARE_OPTION_LINKEDIN_CLASSES}
                  >
                    <svg
                      className={SHARE_OPTION_ICON_CLASSES}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className={SHARE_OPTION_LABEL_CLASSES}>
                      {t("game.share.options.linkedin")}
                    </span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className={SHARE_OPTION_COPY_CLASSES}
                  >
                    <svg
                      className={SHARE_OPTION_ICON_CLASSES}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className={SHARE_OPTION_LABEL_CLASSES}>
                      {copied
                        ? t("game.share.copySuccess")
                        : t("game.share.copyLink")}
                    </span>
                  </button>
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
