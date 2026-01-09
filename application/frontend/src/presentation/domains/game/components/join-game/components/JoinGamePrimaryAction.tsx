import { PrimaryButton } from "../../../../../../presentation/shared/ui/components";
import { useTranslation } from "react-i18next";
import { JOIN_GAME_PIN_LENGTH } from "../constants";
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
      <PrimaryButton
        size="xl"
        fullWidth
        effect="retro"
        alignment="center"
        onClick={onSubmit}
        disabled={!isComplete}
        icon={{ name: "Play" }}
      >
        {resolvedButtonLabel}
      </PrimaryButton>

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
