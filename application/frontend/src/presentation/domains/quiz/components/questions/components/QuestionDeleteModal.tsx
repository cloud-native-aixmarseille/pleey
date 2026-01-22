import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../../../presentation/shared/ui/components";
import type { Question } from "../../../../../../domains/quiz/types";

interface QuestionDeleteModalProps {
  question: Question | null;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function QuestionDeleteModal({
  question,
  isProcessing,
  onCancel,
  onConfirm,
}: QuestionDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      isOpen={question !== null}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isProcessing={isProcessing}
      title={t("quiz.modals.deleteTitle")}
      description={t("quiz.modals.deleteDescription")}
      confirmLabel={t("quiz.deleteQuestion")}
      body={t("quiz.modals.deletePrompt", {
        question: question?.questionText ?? "",
      })}
      variant="danger"
    />
  );
}
