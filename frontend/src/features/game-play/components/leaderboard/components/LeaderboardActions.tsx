import { Button } from "../../../../../shared/components";
import { ACTIONS_STAGE } from "../constants";
import { ShareButton } from "../../ShareButton";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LeaderboardActions", {
  slot1: "max-w-md mx-auto space-y-4 animate-fade-in",
  slot2: "retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider",
  slot3: "flex items-center justify-center gap-3",
  slot4: "text-2xl",
  slot5: "w-full",
  slot6: "text-center pt-4",
  slot7: "text-light-400 text-sm font-body",
});


interface LeaderboardActionsProps {
  animationStage: number;
  onPlayAgain: () => void;
  shareTitle: string;
  shareText: string;
}

export function LeaderboardActions({
  animationStage,
  onPlayAgain,
  shareTitle,
  shareText,
}: LeaderboardActionsProps) {
  if (animationStage < ACTIONS_STAGE) {
    return null;
  }

  return (
    <section
      {...styles.slot1}
      style={{ animationDelay: "0.5s" }}
    >
      <Button
        variant="accent"
        size="xl"
        fullWidth
        onClick={onPlayAgain}
        {...styles.slot2}
      >
        <span {...styles.slot3}>
          <span {...styles.slot4}>▶</span>
          <span>Play Again</span>
        </span>
      </Button>

      <ShareButton
        title={shareTitle}
        text={shareText}
        variant="primary"
        size="xl"
        {...styles.slot5}
      />

      <div {...styles.slot6}>
        <p {...styles.slot7}>
          Thanks for playing! 🎮✨
        </p>
      </div>
    </section>
  );
}
