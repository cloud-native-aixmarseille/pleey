import { ReactNode } from "react";

import { Button } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("RegisterPrompt", {
  slot1: "relative my-6",
  slot2: "absolute inset-0 flex items-center",
  slot3: "w-full border-t border-light-300",
  slot4: "relative flex justify-center text-sm",
  slot5: "px-4 bg-white text-light-600 font-medium flex items-center gap-2",
  slot6: "border-2 border-primary-500/20",
  slot7: "flex items-center justify-center gap-2",
});


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
      <div {...styles.slot1}>
        <div {...styles.slot2}>
          <div {...styles.slot3} />
        </div>
        <div {...styles.slot4}>
          <span {...styles.slot5}>
            {dividerIcon}
            <span>{message}</span>
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="md"
        fullWidth
        onClick={onCtaClick}
        {...styles.slot6}
      >
        <span {...styles.slot7}>
          <span>{ctaLabel}</span>
          {ctaIcon ? <span>{ctaIcon}</span> : null}
        </span>
      </Button>
    </div>
  );
}
