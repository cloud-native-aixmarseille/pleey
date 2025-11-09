import { useTranslation } from "react-i18next";
import {
  ArcadeSectionHeader,
  BackToButton,
  Button,
  Card,
  SecondaryButton,
} from "../../../../../shared/components";
import type { Quiz } from "../../../../../shared/types";

interface QuestionsHeaderProps {
  quiz: Quiz;
  questionCount: number;
  onBack: () => void;
  onViewSessions: () => void;
  onAddQuestion: () => void;
}

export function QuestionsHeader({
  quiz,
  questionCount,
  onBack,
  onViewSessions,
  onAddQuestion,
}: QuestionsHeaderProps) {
  const { t } = useTranslation();
  const questionLabel =
    questionCount === 1 ? t("quiz.question") : t("quiz.questionsPlural");

  return (
    <Card motion="slide-down">
      <ArcadeSectionHeader
        leadingSlot={
          <BackToButton
            label={t("quiz.back")}
            onClick={onBack}
            variant="ghost"
          />
        }
        icon="📝"
        title={quiz.title}
        subtitle={quiz.description ?? undefined}
        meta={`${questionCount} ${questionLabel}`}
        actions={
          <>
            <SecondaryButton
              size="lg"
              onClick={onViewSessions}
              icon={{ name: "CalendarClock" }}
            >
              {t("admin.viewSessions")}
            </SecondaryButton>
            <Button
              variant="accent"
              size="lg"
              onClick={onAddQuestion}
              icon={{ name: "CirclePlus" }}
            >
              {t("quiz.addQuestion")}
            </Button>
          </>
        }
      />
    </Card>
  );
}
