import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Modal,
  SecondaryButton,
} from "../../../../../presentation/shared/ui/components";

const FORM_CONTENT_CLASSES = "space-y-6";
const LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-[0.3em] text-light-500";
const INPUT_WRAPPER_CLASSES = "mt-2";
const TEXTAREA_CLASSES =
  "mt-2 w-full rounded-2xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none";

interface CreateQuizModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export function CreateQuizModal({
  isOpen,
  isProcessing,
  title,
  description,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
}: CreateQuizModalProps) {
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
      title={t("admin.createQuizModalTitle")}
      description={t("admin.createQuizModalDescription")}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </SecondaryButton>
          <Button
            type="submit"
            form="create-quiz-form"
            variant="accent"
            disabled={isProcessing || !title.trim()}
          >
            {isProcessing ? t("common.loading") : t("admin.createQuiz")}
          </Button>
        </>
      }
    >
      <form id="create-quiz-form" onSubmit={onSubmit}>
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
          <div>
            <label className={LABEL_CLASSES}>{t("admin.description")}</label>
            <textarea
              value={description}
              onChange={onDescriptionChange}
              rows={4}
              className={TEXTAREA_CLASSES}
              placeholder={t("admin.promptQuizDescription")}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
