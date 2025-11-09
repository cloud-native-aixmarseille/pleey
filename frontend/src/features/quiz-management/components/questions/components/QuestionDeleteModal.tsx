import { useTranslation } from "react-i18next";
import {
  Button,
  Modal,
  SecondaryButton,
} from "../../../../../shared/components";
import type { Question } from "../../../../../shared/types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("QuestionDeleteModal", {
  slot1: "text-sm text-light-200",
});


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
      <p {...styles.slot1}>
        {t("quiz.modals.deletePrompt", {
          question: question?.question_text ?? "",
        })}
      </p>
    </Modal>
  );
}
