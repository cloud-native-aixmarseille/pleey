import { useTranslation } from "react-i18next";
import {
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
    <Card className="p-6 sm:p-8 mb-6 animate-slide-down">
      <div className="mb-4">
        <BackToButton label={t("quiz.back")} onClick={onBack} variant="ghost" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">📝</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
              {quiz.title}
            </h2>
          </div>
          <p className="text-light-700 mb-4">{quiz.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold">
              {questionCount} {questionLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SecondaryButton
            size="lg"
            onClick={onViewSessions}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8a3 3 0 100 6 3 3 0 000-6zm0-6a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            }
          >
            {t("admin.viewSessions")}
          </SecondaryButton>
          <Button
            variant="accent"
            size="lg"
            onClick={onAddQuestion}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {t("quiz.addQuestion")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
