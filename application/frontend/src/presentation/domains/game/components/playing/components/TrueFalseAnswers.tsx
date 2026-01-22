import { useTranslation } from "react-i18next";

import {
  ArcadeCardGrid,
  DangerButton,
  PrimaryButton,
} from "../../../../../../presentation/shared/ui/components";

const OPTION_WRAPPER_BASE_CLASSES =
  "animate-scale-in transition-all duration-300";

const OPTION_WRAPPER_SELECTED_CLASSES =
  "rounded-[var(--arcade-radius-lg)] ring-4 ring-white/80 ring-offset-2 ring-offset-transparent";

interface TrueFalseAnswersProps {
  userAnswer: number | null;
  answerSubmitted: boolean;
  trueAnswerId: number;
  falseAnswerId: number;
  onSubmit: (answerId: number) => void;
}

export function TrueFalseAnswers({
  userAnswer,
  answerSubmitted,
  trueAnswerId,
  falseAnswerId,
  onSubmit,
}: TrueFalseAnswersProps) {
  const { t } = useTranslation();

  return (
    <ArcadeCardGrid layout="double" bottomSpacing="none" role="group">
      <div
        className={
          userAnswer === trueAnswerId
            ? `${OPTION_WRAPPER_BASE_CLASSES} ${OPTION_WRAPPER_SELECTED_CLASSES}`
            : OPTION_WRAPPER_BASE_CLASSES
        }
      >
        <PrimaryButton
          size="xl"
          effect="retro"
          fullWidth
          onClick={() => onSubmit(trueAnswerId)}
          disabled={answerSubmitted}
          aria-pressed={userAnswer === trueAnswerId}
          icon={{ name: "Check" }}
        >
          {t("game.playing.trueFalse.trueWord")}
        </PrimaryButton>
      </div>

      <div
        className={
          userAnswer === falseAnswerId
            ? `${OPTION_WRAPPER_BASE_CLASSES} ${OPTION_WRAPPER_SELECTED_CLASSES}`
            : OPTION_WRAPPER_BASE_CLASSES
        }
        style={{ animationDelay: "100ms" }}
      >
        <DangerButton
          size="xl"
          effect="retro"
          fullWidth
          onClick={() => onSubmit(falseAnswerId)}
          disabled={answerSubmitted}
          aria-pressed={userAnswer === falseAnswerId}
          icon={{ name: "Cross" }}
        >
          {t("game.playing.trueFalse.falseWord")}
        </DangerButton>
      </div>
    </ArcadeCardGrid>
  );
}
