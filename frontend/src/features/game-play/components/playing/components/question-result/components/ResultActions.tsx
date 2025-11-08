import { Button } from "../../../../../../../shared/components";
import { ShareButton } from "../../../../ShareButton";

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
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <ShareButton
        title={shareTitle}
        text={shareText}
        className="flex-1 w-full sm:w-auto"
      />

      {isAdmin && (
        <Button
          variant="ghost"
          size="xl"
          onClick={onNextQuestion}
          className="border-2 border-white text-white hover:bg-white hover:text-dark-900 flex-1 w-full sm:w-auto font-display uppercase"
        >
          <span className="flex items-center gap-2">
            <span>{nextQuestionLabel}</span>
            <span className="text-2xl">→</span>
          </span>
        </Button>
      )}
    </div>
  );
}
