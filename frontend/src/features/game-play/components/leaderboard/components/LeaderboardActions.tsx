import { Button } from "../../../../../shared/components";
import { ACTIONS_STAGE } from "../constants";
import { ShareButton } from "../../ShareButton";

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
      className="max-w-md mx-auto space-y-4 animate-fade-in"
      style={{ animationDelay: "0.5s" }}
    >
      <Button
        variant="accent"
        size="xl"
        fullWidth
        onClick={onPlayAgain}
        className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-2xl">▶</span>
          <span>Play Again</span>
        </span>
      </Button>

      <ShareButton
        title={shareTitle}
        text={shareText}
        variant="primary"
        size="xl"
        className="w-full"
      />

      <div className="text-center pt-4">
        <p className="text-light-400 text-sm font-body">
          Thanks for playing! 🎮✨
        </p>
      </div>
    </section>
  );
}
