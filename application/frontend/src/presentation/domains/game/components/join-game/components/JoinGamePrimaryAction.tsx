import { Button } from "../../../../../../presentation/shared/ui/components";
import { useTranslation } from "react-i18next";
import { JOIN_GAME_PIN_LENGTH } from "../constants";

const BUTTON_WRAPPER_CLASSES =
  "retro-shadow transform transition-transform hover:scale-105";
const BUTTON_CONTENT_CLASSES =
  "flex items-center justify-center gap-3 font-display text-base sm:text-lg";
const BUTTON_ICON_CLASSES = "animate-pulse";
const COMPLETE_MESSAGE_WRAPPER_CLASSES = "mt-6 animate-fade-in text-center";
const COMPLETE_MESSAGE_TEXT_CLASSES =
  "font-mono text-sm text-success-500 animate-pulse";

interface JoinGamePrimaryActionProps {
  gamePin: string;
  onSubmit: () => void;
  buttonLabel?: string;
  completeMessage?: string;
}

export function JoinGamePrimaryAction({
  gamePin,
  onSubmit,
  buttonLabel,
  completeMessage,
}: JoinGamePrimaryActionProps) {
  const { t } = useTranslation();
  const resolvedButtonLabel =
    buttonLabel ?? t("game.joinPage.primaryAction.button");
  const resolvedCompleteMessage =
    completeMessage ?? t("game.joinPage.primaryAction.completeMessage");
  const isComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;

  return (
    <section>
      <div className={BUTTON_WRAPPER_CLASSES}>
        <Button
          variant="accent"
          size="xl"
          fullWidth
          effect="retro"
          alignment="center"
          onClick={onSubmit}
          disabled={!isComplete}
        >
          <span className={BUTTON_CONTENT_CLASSES}>
            <span className={BUTTON_ICON_CLASSES}>►</span>
            <span>{resolvedButtonLabel}</span>
            <span className={BUTTON_ICON_CLASSES}>◄</span>
          </span>
        </Button>
      </div>

      {isComplete && resolvedCompleteMessage ? (
        <div className={COMPLETE_MESSAGE_WRAPPER_CLASSES}>
          <p className={COMPLETE_MESSAGE_TEXT_CLASSES}>
            {resolvedCompleteMessage}
          </p>
        </div>
      ) : null}
    </section>
  );
}
