import { useTranslation } from "react-i18next";
import {
  DangerButton,
  Modal,
  SecondaryButton,
} from "../../../../../presentation/shared/ui/components";
import type { Quiz } from "../../../../../domains/quiz/types";
const WARNING_TEXT_CLASSES = "text-sm text-light-200";

interface DeleteQuizModalProps {
  quiz: Quiz | null;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteQuizModal({
  quiz,
  isProcessing,
  onCancel,
  onConfirm,
}: DeleteQuizModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={quiz !== null}
      onClose={onCancel}
      title={t("admin.deleteQuizModalTitle")}
      description={t("admin.deleteQuizModalDescription", {
        title: quiz?.title ?? "",
      })}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </SecondaryButton>
          <DangerButton
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? t("common.loading") : t("admin.confirmDelete")}
          </DangerButton>
        </>
      }
    >
      <p className={WARNING_TEXT_CLASSES}>
        {t("admin.deleteQuizModalWarning")}
      </p>
    </Modal>
  );
}
