import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../../presentation/shared/ui/components";
import type { Quiz } from "../../../../../domains/quiz/types";

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
    <ConfirmModal
      isOpen={quiz !== null}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isProcessing={isProcessing}
      title={t("admin.deleteQuizModalTitle")}
      description={t("admin.deleteQuizModalDescription", {
        title: quiz?.title ?? "",
      })}
      confirmLabel={t("admin.confirmDelete")}
      body={t("admin.deleteQuizModalWarning")}
      variant="danger"
    />
  );
}
