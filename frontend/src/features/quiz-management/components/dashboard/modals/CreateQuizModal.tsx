import type { ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Modal,
  SecondaryButton,
} from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("CreateQuizModal", {
  slot1: "space-y-6",
  slot2: "block text-xs font-semibold uppercase tracking-[0.3em] text-light-500",
  slot3: "mt-2",
  slot4: "mt-2 w-full rounded-2xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none",
});


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
        <div {...styles.slot1}>
          <div>
            <label {...styles.slot2}>
              {t("admin.quizTitle")}
            </label>
            <div {...styles.slot3}>
              <Input
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder={t("admin.quizTitle")}
                required
              />
            </div>
          </div>
          <div>
            <label {...styles.slot2}>
              {t("admin.description")}
            </label>
            <textarea
              value={description}
              onChange={onDescriptionChange}
              rows={4}
              {...styles.slot4}
              placeholder={t("admin.promptQuizDescription")}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
