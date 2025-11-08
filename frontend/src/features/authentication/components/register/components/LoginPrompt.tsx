import { ReactNode } from "react";

import { Button } from "../../../../../shared/components";

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
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-light-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-light-600 font-medium">
            {message}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="md"
        fullWidth
        onClick={onCtaClick}
        className="border-2 border-accent-500/20"
      >
        <span className="flex items-center justify-center gap-2">
          <span>{ctaLabel}</span>
          {ctaIcon ? <span>{ctaIcon}</span> : null}
        </span>
      </Button>
    </div>
  );
}
