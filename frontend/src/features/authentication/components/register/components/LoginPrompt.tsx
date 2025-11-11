import { ReactNode } from "react";

import { Button } from "../../../../../shared/components";

const DIVIDER_WRAPPER_CLASSES = "relative my-6";
const DIVIDER_LINE_CONTAINER_CLASSES = "absolute inset-0 flex items-center";
const DIVIDER_LINE_CLASSES = "w-full border-t border-light-400/30";
const DIVIDER_CONTENT_CLASSES =
  "relative flex justify-center text-xs uppercase tracking-[0.3em]";
const DIVIDER_LABEL_CLASSES =
  "inline-flex items-center gap-2 rounded-full bg-dark-600/80 px-4 py-2 text-light-300 shadow-inner";
const CTA_WRAPPER_CLASSES =
  "rounded-[var(--arcade-radius-lg)] border border-accent-500/20 bg-dark-700/40 p-[2px]";
const CTA_CONTENT_CLASSES = "flex items-center justify-center gap-2";

interface LoginPromptProps {
  message: string;
  ctaLabel: string;
  onCtaClick: () => void;
  ctaIcon?: ReactNode;
}

export function LoginPrompt({
  message,
  ctaLabel,
  onCtaClick,
  ctaIcon,
}: LoginPromptProps) {
  return (
    <div>
      <div className={DIVIDER_WRAPPER_CLASSES}>
        <div className={DIVIDER_LINE_CONTAINER_CLASSES}>
          <div className={DIVIDER_LINE_CLASSES} />
        </div>
        <div className={DIVIDER_CONTENT_CLASSES}>
          <span className={DIVIDER_LABEL_CLASSES}>{message}</span>
        </div>
      </div>

      <div className={CTA_WRAPPER_CLASSES}>
        <Button
          variant="ghost"
          tone="secondary"
          size="md"
          fullWidth
          onClick={onCtaClick}
        >
          <span className={CTA_CONTENT_CLASSES}>
            <span>{ctaLabel}</span>
            {ctaIcon ? <span>{ctaIcon}</span> : null}
          </span>
        </Button>
      </div>
    </div>
  );
}
