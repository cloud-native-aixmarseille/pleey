import { ReactNode } from "react";

import { Button } from "../../../../../shared/components";

const DIVIDER_WRAPPER_CLASSES = "relative my-6";
const DIVIDER_LINE_CONTAINER_CLASSES = "absolute inset-0 flex items-center";
const DIVIDER_LINE_CLASSES =
  "w-full border-t border-dark-300/30 dark:border-light-400/30";
const DIVIDER_CONTENT_CLASSES =
  "relative flex justify-center text-xs uppercase tracking-[0.3em]";
const DIVIDER_LABEL_CLASSES =
  "inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-light-100/85 px-4 py-2 text-dark-400 shadow-inner dark:border-light-500/20 dark:bg-dark-600/80 dark:text-light-300";
const CTA_WRAPPER_CLASSES =
  "rounded-[var(--arcade-radius-lg)] border border-primary-500/20 bg-light-50/70 p-[2px] dark:bg-dark-700/40";
const CTA_CONTENT_CLASSES = "flex items-center justify-center gap-2";

interface RegisterPromptProps {
  message: string;
  ctaLabel: string;
  onCtaClick: () => void;
  dividerIcon?: ReactNode;
  ctaIcon?: ReactNode;
}

export function RegisterPrompt({
  message,
  ctaLabel,
  onCtaClick,
  dividerIcon,
  ctaIcon,
}: RegisterPromptProps) {
  return (
    <div>
      <div className={DIVIDER_WRAPPER_CLASSES}>
        <div className={DIVIDER_LINE_CONTAINER_CLASSES}>
          <div className={DIVIDER_LINE_CLASSES} />
        </div>
        <div className={DIVIDER_CONTENT_CLASSES}>
          <span className={DIVIDER_LABEL_CLASSES}>
            {dividerIcon}
            <span>{message}</span>
          </span>
        </div>
      </div>

      <div className={CTA_WRAPPER_CLASSES}>
        <Button
          variant="ghost"
          tone="accent"
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
