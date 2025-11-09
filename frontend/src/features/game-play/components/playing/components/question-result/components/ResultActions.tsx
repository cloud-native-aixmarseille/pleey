import { Button } from "../../../../../../../shared/components";
import { ShareButton } from "../../../../ShareButton";
import { createStyles } from "../../../../../../../shared/ui/styles";

const styles = createStyles("ResultActions", {
  slot1: "flex flex-col sm:flex-row gap-4 items-center justify-center",
  slot2: "flex-1 w-full sm:w-auto",
  slot3: "border-2 border-white text-white hover:bg-white hover:text-dark-900 flex-1 w-full sm:w-auto font-display uppercase",
  slot4: "flex items-center gap-2",
  slot5: "text-2xl",
});


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
    <div {...styles.slot1}>
      <ShareButton
        title={shareTitle}
        text={shareText}
        {...styles.slot2}
      />

      {isAdmin && (
        <Button
          variant="ghost"
          size="xl"
          onClick={onNextQuestion}
          {...styles.slot3}
        >
          <span {...styles.slot4}>
            <span>{nextQuestionLabel}</span>
            <span {...styles.slot5}>→</span>
          </span>
        </Button>
      )}
    </div>
  );
}
