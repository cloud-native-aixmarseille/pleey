import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../../../../../../presentation/shared/ui/components";

const EMPTY_STATE_WRAPPER_CLASSES = "animate-scale-in text-center";
const EMPTY_STATE_CONTENT_CLASSES = "flex flex-col items-center gap-4 p-12";
const EMPTY_STATE_ICON_CLASSES = "text-6xl";
const EMPTY_STATE_TITLE_CLASSES = "text-2xl font-bold text-dark-800";
const EMPTY_STATE_DESCRIPTION_CLASSES = "text-light-700";

interface QuestionsEmptyStateProps {
  onAddQuestion: () => void;
}

export function QuestionsEmptyState({
  onAddQuestion,
}: QuestionsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={EMPTY_STATE_WRAPPER_CLASSES} data-questions-empty="true">
      <Card
        surface="glass"
        tone="neutral"
        padding="xl"
        elevation="glow"
        border="regular"
        alignment="center"
      >
        <div className={EMPTY_STATE_CONTENT_CLASSES}>
          <div className={EMPTY_STATE_ICON_CLASSES} aria-hidden="true">
            ❓
          </div>
          <h3 className={EMPTY_STATE_TITLE_CLASSES}>
            {t("quiz.noQuestionsTitle")}
          </h3>
          <p className={EMPTY_STATE_DESCRIPTION_CLASSES}>
            {t("quiz.noQuestionsDescription")}
          </p>
          <PrimaryButton size="lg" onClick={onAddQuestion}>
            {t("quiz.addFirstQuestion")}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
