import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/components";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

export function ShareButton({
  title,
  text,
  url = window.location.href,
  className = "",
  variant = "outline",
  size = "lg",
}: ShareButtonProps) {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showShareMenu) {
        setShowShareMenu(false);
        setShareError(null);
        shareButtonRef.current?.focus();
      }
    };

    if (showShareMenu) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showShareMenu]);

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
          url,
        });
        setShareError(null);
      } catch (err) {
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
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    setShareError(null);
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
    setShareError(null);
    setShowShareMenu(false);
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedInUrl, "_blank", "width=550,height=420");
    setShareError(null);
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setShareError(null);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      setShareError(t("game.share.errors.copyFailed"));
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <Button
        ref={shareButtonRef}
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={`font-display uppercase tracking-wider ${className}`}
        aria-haspopup="dialog"
        aria-expanded={showShareMenu}
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
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
          <span>Share</span>
        </span>
      </Button>

      {/* Custom Share Menu (fallback for browsers without Web Share API) */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setShowShareMenu(false);
              setShareError(null);
              shareButtonRef.current?.focus();
            }}
            aria-hidden="true"
          ></div>

          {/* Share Menu */}
          <div
            ref={modalRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
          >
            <div className="bg-dark-400 border-2 border-primary-500 rounded-2xl p-6 shadow-neon-accent">
              <div className="flex justify-between items-center mb-6">
                <h3
                  id="share-dialog-title"
                  className="text-2xl font-bold text-white font-display uppercase"
                >
                  Share Results
                </h3>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    setShareError(null);
                    shareButtonRef.current?.focus();
                  }}
                  className="text-white hover:text-danger-500 transition-colors text-3xl leading-none"
                  aria-label="Close share dialog"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {/* Twitter */}
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#1DA1F2] to-[#0d8bd9] text-white rounded-lg hover:scale-105 transition-transform retro-shadow"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span className="font-bold font-body">Share on Twitter</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#1877F2] to-[#0d5fbf] text-white rounded-lg hover:scale-105 transition-transform retro-shadow"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-bold font-body">Share on Facebook</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareToLinkedIn}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#0077B5] to-[#005582] text-white rounded-lg hover:scale-105 transition-transform retro-shadow"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="font-bold font-body">Share on LinkedIn</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-accent-500 to-accent-600 text-dark-900 rounded-lg hover:scale-105 transition-transform retro-shadow"
                >
                  <svg
                    className="w-6 h-6"
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
                  <span className="font-bold font-body">
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>

              {shareError && (
                <p
                  className="mt-4 text-sm text-danger-400 font-medium"
                  role="alert"
                  aria-live="assertive"
                >
                  {shareError}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
