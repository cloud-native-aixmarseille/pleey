import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CancelButton,
  Input,
  Modal,
  SaveButton,
} from "../../../../../presentation/shared/ui/components";

const FORM_CONTENT_CLASSES = "space-y-6";
const LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-[0.3em] text-light-500";
const INPUT_WRAPPER_CLASSES = "mt-2";

interface EditQuizTitleModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function EditQuizTitleModal({
  isOpen,
  isProcessing,
  title,
  onClose,
  onSubmit,
  onTitleChange,
}: EditQuizTitleModalProps) {
  const { t } = useTranslation();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("quiz.modals.editQuizTitle")}
      description={t("quiz.modals.editQuizTitleDescription")}
      footer={
        <>
          <CancelButton
            type="button"
            onClick={onClose}
            disabled={isProcessing}
          />
          <SaveButton
            type="submit"
            form="edit-quiz-title-form"
            disabled={isProcessing || !title.trim()}
            isLoading={isProcessing}
          />
        </>
      }
    >
      <form id="edit-quiz-title-form" onSubmit={onSubmit}>
        <div className={FORM_CONTENT_CLASSES}>
          <div>
            <label className={LABEL_CLASSES}>{t("admin.quizTitle")}</label>
            <div className={INPUT_WRAPPER_CLASSES}>
              <Input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder={t("admin.quizTitle")}
                required
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
