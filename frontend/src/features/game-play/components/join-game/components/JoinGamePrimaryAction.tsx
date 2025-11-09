import { Button } from "../../../../../shared/components";
import { JOIN_GAME_PIN_LENGTH } from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGamePrimaryAction", {
  slot1: "retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all",
  slot2: "flex items-center justify-center gap-3",
  slot3: "animate-pulse",
  slot4: "mt-6 text-center animate-fade-in",
  slot5: "font-mono text-success-500 text-sm animate-pulse",
});


interface JoinGamePrimaryActionProps {
  gamePin: string;
  onSubmit: () => void;
  buttonLabel?: string;
  completeMessage?: string;
}

const DEFAULT_BUTTON_LABEL = "START GAME";
const DEFAULT_COMPLETE_MESSAGE = "✓ PIN COMPLETE - PRESS START OR ENTER";

export function JoinGamePrimaryAction({
  gamePin,
  onSubmit,
  buttonLabel = DEFAULT_BUTTON_LABEL,
  completeMessage = DEFAULT_COMPLETE_MESSAGE,
}: JoinGamePrimaryActionProps) {
  const isComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;

  return (
    <section>
      <Button
        variant="accent"
        size="xl"
        fullWidth
        onClick={onSubmit}
        disabled={!isComplete}
        {...styles.slot1}
      >
        <span {...styles.slot2}>
          <span {...styles.slot3}>►</span>
          <span>{buttonLabel}</span>
          <span {...styles.slot3}>◄</span>
        </span>
      </Button>

      {isComplete && completeMessage && (
        <div {...styles.slot4}>
          <p {...styles.slot5}>
            {completeMessage}
          </p>
        </div>
      )}
    </section>
  );
}
