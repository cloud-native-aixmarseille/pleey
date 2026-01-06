import { Button } from "../../../../../../../../presentation/shared/ui/components";
import { ShareButton } from "../../../../ShareButton";

const ACTIONS_CONTAINER_CLASSES =
  "flex flex-col items-center justify-center gap-4 sm:flex-row";
const SHARE_BUTTON_CONTAINER_CLASSES =
  "flex w-full flex-1 justify-center sm:w-auto";
const NEXT_BUTTON_WRAPPER_CLASSES = "flex w-full flex-1 sm:w-auto";
const NEXT_BUTTON_CONTENT_CLASSES = "flex items-center gap-3";
const NEXT_BUTTON_ICON_CLASSES = "text-2xl";

interface ResultActionsProps {
  shareTitle: string;
  shareText: string;
  isAdmin: boolean;
  onNextQuestion: () => void;
  nextQuestionLabel: string;
}

export function ResultActions({
  shareTitle,
  shareText,
  isAdmin,
  onNextQuestion,
  nextQuestionLabel,
}: ResultActionsProps) {
  return (
    <div className={ACTIONS_CONTAINER_CLASSES} data-result-actions="true">
      <div className={SHARE_BUTTON_CONTAINER_CLASSES}>
        <ShareButton title={shareTitle} text={shareText} size="xl" />
      </div>

      {isAdmin && (
        <div className={NEXT_BUTTON_WRAPPER_CLASSES}>
          <Button
            variant="ghost"
            tone="neutral"
            size="xl"
            effect="glow"
            fullWidth
            onClick={onNextQuestion}
          >
            <span className={NEXT_BUTTON_CONTENT_CLASSES}>
              <span>{nextQuestionLabel}</span>
              <span className={NEXT_BUTTON_ICON_CLASSES} aria-hidden="true">
                →
              </span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
