import { SecondaryButton } from "../../../../../../../../presentation/shared/ui/components";
import { ShareButton } from "../../../../ShareButton";

const ACTIONS_CONTAINER_CLASSES =
  "flex flex-col items-center justify-center gap-4 sm:flex-row";
const SHARE_BUTTON_CONTAINER_CLASSES =
  "flex w-full flex-1 justify-center sm:w-auto";
const NEXT_BUTTON_WRAPPER_CLASSES = "flex w-full flex-1 sm:w-auto";

interface ResultActionsProps {
  shareTitle: string;
  shareText: string;
  isHost: boolean;
  onNextQuestion: () => void;
  nextQuestionLabel: string;
}

export function ResultActions({
  shareTitle,
  shareText,
  isHost,
  onNextQuestion,
  nextQuestionLabel,
}: ResultActionsProps) {
  return (
    <div className={ACTIONS_CONTAINER_CLASSES} data-result-actions="true">
      <div className={SHARE_BUTTON_CONTAINER_CLASSES}>
        <ShareButton title={shareTitle} text={shareText} size="xl" />
      </div>

      {isHost && (
        <div className={NEXT_BUTTON_WRAPPER_CLASSES}>
          <SecondaryButton
            size="xl"
            fullWidth
            onClick={onNextQuestion}
            icon={{ name: "ArrowRight" }}
          >
            {nextQuestionLabel}
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}
