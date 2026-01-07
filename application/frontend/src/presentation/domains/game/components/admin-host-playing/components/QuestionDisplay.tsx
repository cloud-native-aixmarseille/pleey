import {
  ArcadeBadge,
  Card,
} from "../../../../../../presentation/shared/ui/components";
import { useTranslation } from "react-i18next";
import type { Question } from "../../../../../../domains/quiz/types";

const QUESTION_CARD_CONTENT_CLASSES =
  "flex flex-col items-center gap-6 text-center animate-scale-in";
const QUESTION_BADGE_WRAPPER_CLASSES = "flex justify-center";
const QUESTION_TITLE_CLASSES =
  "font-display text-4xl font-black uppercase leading-tight text-dark-900 sm:text-5xl md:text-6xl lg:text-7xl";

interface QuestionDisplayProps {
  question: Question;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const { t } = useTranslation();
  const questionTypeLabel =
    question.type === "multiple"
      ? t("game.hostPlaying.question.type.multiple")
      : t("game.hostPlaying.question.type.trueFalse");
  const badgeTone = question.type === "multiple" ? "accent" : "secondary";

  return (
    <Card
      surface="panel"
      variant="neutral"
      padding="xl"
      border="thick"
      elevation="glow"
      motion="scale"
      alignment="center"
      data-question-display="true"
    >
      <div className={QUESTION_CARD_CONTENT_CLASSES}>
        <div className={QUESTION_BADGE_WRAPPER_CLASSES}>
          <ArcadeBadge variant={badgeTone} size="sm">
            {questionTypeLabel}
          </ArcadeBadge>
        </div>
        <h2 className={QUESTION_TITLE_CLASSES}>{question.question_text}</h2>
      </div>
    </Card>
  );
}
