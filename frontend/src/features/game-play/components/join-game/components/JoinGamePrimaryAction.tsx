import { Button } from "../../../../../shared/components";
import { JOIN_GAME_PIN_LENGTH } from "../constants";

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
        className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="animate-pulse">►</span>
          <span>{buttonLabel}</span>
          <span className="animate-pulse">◄</span>
        </span>
      </Button>

      {isComplete && completeMessage && (
        <div className="mt-6 text-center animate-fade-in">
          <p className="font-mono text-success-500 text-sm animate-pulse">
            {completeMessage}
          </p>
        </div>
      )}
    </section>
  );
}
