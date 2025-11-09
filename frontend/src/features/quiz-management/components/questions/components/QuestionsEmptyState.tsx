import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("QuestionsEmptyState", {
  slot1: "p-12 text-center animate-scale-in",
  slot2: "text-6xl mb-4",
  slot3: "text-2xl font-bold text-dark-800 mb-2",
  slot4: "text-light-700 mb-6",
});


interface QuestionsEmptyStateProps {
  onAddQuestion: () => void;
}

export function QuestionsEmptyState({
  onAddQuestion,
}: QuestionsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card {...styles.slot1}>
      <div {...styles.slot2}>❓</div>
      <h3 {...styles.slot3}>
        {t("quiz.noQuestionsTitle")}
      </h3>
      <p {...styles.slot4}>{t("quiz.noQuestionsDescription")}</p>
      <PrimaryButton size="lg" onClick={onAddQuestion}>
        {t("quiz.addFirstQuestion")}
      </PrimaryButton>
    </Card>
  );
}
