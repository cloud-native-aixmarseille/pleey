import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../../../../../shared/components";

interface QuestionsEmptyStateProps {
  onAddQuestion: () => void;
}

export function QuestionsEmptyState({
  onAddQuestion,
}: QuestionsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-12 text-center animate-scale-in">
      <div className="text-6xl mb-4">❓</div>
      <h3 className="text-2xl font-bold text-dark-800 mb-2">
        {t("quiz.noQuestionsTitle")}
      </h3>
      <p className="text-light-700 mb-6">{t("quiz.noQuestionsDescription")}</p>
      <PrimaryButton size="lg" onClick={onAddQuestion}>
        {t("quiz.addFirstQuestion")}
      </PrimaryButton>
    </Card>
  );
}
