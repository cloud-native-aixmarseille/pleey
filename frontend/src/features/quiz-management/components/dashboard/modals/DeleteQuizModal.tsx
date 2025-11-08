import { useTranslation } from "react-i18next";
import {
  Button,
  Modal,
  SecondaryButton,
} from "../../../../../shared/components";
import type { Quiz } from "../../../../../shared/types";

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
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? t("common.loading") : t("admin.confirmDelete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-light-200">
        {t("admin.deleteQuizModalWarning")}
      </p>
    </Modal>
  );
}
