import { useTranslation } from "react-i18next";
import {
  Button,
  Modal,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import type { Question } from "../../../../../../domains/quiz/types";
const WARNING_TEXT_CLASSES = "text-sm text-light-200";

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
    <Modal
      isOpen={question !== null}
      onClose={onCancel}
      title={t("quiz.modals.deleteTitle")}
      description={t("quiz.modals.deleteDescription")}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </SecondaryButton>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? t("common.loading") : t("quiz.deleteQuestion")}
          </Button>
        </>
      }
    >
      <p className={WARNING_TEXT_CLASSES}>
        {t("quiz.modals.deletePrompt", {
          question: question?.question_text ?? "",
        })}
      </p>
    </Modal>
  );
}
