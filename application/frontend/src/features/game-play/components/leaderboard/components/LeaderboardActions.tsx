import { Button } from "../../../../../shared/components";
import { ACTIONS_STAGE } from "../constants";
import { ShareButton } from "../../ShareButton";

const ACTIONS_WRAPPER_CLASSES = "mx-auto max-w-md space-y-4 animate-fade-in";
const PLAY_AGAIN_WRAPPER_CLASSES =
  "retro-shadow transition-transform hover:translate-x-1 hover:translate-y-1";
const PLAY_AGAIN_CONTENT_CLASSES =
  "flex items-center justify-center gap-3 font-display uppercase tracking-wider";
const PLAY_AGAIN_ICON_CLASSES = "text-2xl";
const SHARE_BUTTON_WRAPPER_CLASSES = "w-full";
const FOOTER_WRAPPER_CLASSES = "pt-4 text-center";
const FOOTER_TEXT_CLASSES = "font-body text-sm text-light-400";

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
      className={ACTIONS_WRAPPER_CLASSES}
      style={{ animationDelay: "0.5s" }}
    >
      <div className={PLAY_AGAIN_WRAPPER_CLASSES}>
        <Button
          variant="accent"
          size="xl"
          fullWidth
          effect="retro"
          alignment="center"
          onClick={onPlayAgain}
        >
          <span className={PLAY_AGAIN_CONTENT_CLASSES}>
            <span className={PLAY_AGAIN_ICON_CLASSES}>▶</span>
            <span>Play Again</span>
          </span>
        </Button>
      </div>

      <div className={SHARE_BUTTON_WRAPPER_CLASSES}>
        <ShareButton
          title={shareTitle}
          text={shareText}
          variant="primary"
          size="xl"
        />
      </div>

      <div className={FOOTER_WRAPPER_CLASSES}>
        <p className={FOOTER_TEXT_CLASSES}>Thanks for playing! 🎮✨</p>
      </div>
    </section>
  );
}
