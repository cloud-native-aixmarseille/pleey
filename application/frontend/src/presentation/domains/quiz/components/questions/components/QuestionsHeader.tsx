import { useTranslation } from "react-i18next";
import {
  ArcadeSectionHeader,
  BackToButton,
  Card,
  PrimaryButton,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import type { Quiz } from "../../../../../../domains/quiz/types";

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
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <BackToButton label={t("quiz.back")} onClick={onBack} />
          <SecondaryButton
            size="md"
            onClick={onViewSessions}
            icon={{ name: "CalendarClock" }}
          >
            {t("admin.viewSessions")}
          </SecondaryButton>
        </div>

        <div className="relative">
          <ArcadeSectionHeader
            icon="📝"
            title={quiz.title}
            subtitle={quiz.description ?? undefined}
            meta={`${questionCount} ${questionLabel}`}
          />

          <div className="mt-6 flex justify-end">
            <PrimaryButton
              size="lg"
              onClick={onAddQuestion}
              icon={{ name: "CirclePlus" }}
            >
              {t("quiz.addQuestion")}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Card>
  );
}
