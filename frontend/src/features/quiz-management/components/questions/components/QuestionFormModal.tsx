import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  ArcadeToggleGroup,
  Button,
  Input,
  Modal,
  SecondaryButton,
} from "../../../../../shared/components";
import type {
  OptionKey,
  QuestionFormState,
  QuestionType,
} from "../questionFormState";
import { handleNumericFieldChange } from "../questionFormState";
import { createStyles } from "../../../../../shared/ui/styles";
import type { ArcadeBadgeTone } from "../../../../../shared/ui/components/ArcadeBadge";

const styles = createStyles("QuestionFormModal", {
  slot1: "space-y-6",
  slot2:
    "block text-xs font-semibold uppercase tracking-[0.3em] text-light-400",
  slot3:
    "mt-2 w-full rounded-3xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none",
  slot4: "mt-3 flex flex-wrap gap-3",
  slot5: "grid grid-cols-1 md:grid-cols-2 gap-4",
  slot7:
    "rounded-2xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-200 shadow-neon-secondary",
});

interface QuestionFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  formState: QuestionFormState;
  isSubmitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: <K extends keyof QuestionFormState>(
    key: K,
    value: QuestionFormState[K]
  ) => void;
  onOptionChange: (key: OptionKey, value: string) => void;
  onTypeChange: (type: QuestionType) => void;
  onSelectCorrectAnswer: (value: string) => void;
}

export function QuestionFormModal({
  isOpen,
  mode,
  formState,
  isSubmitting,
  formError,
  onClose,
  onSubmit,
  onFieldChange,
  onOptionChange,
  onTypeChange,
  onSelectCorrectAnswer,
}: QuestionFormModalProps) {
  const { t } = useTranslation();
  const correctAnswerOptions = buildCorrectAnswerOptions(formState.type, t);
  const questionTypeOptions: Array<{
    value: QuestionType;
    label: string;
    tone: ArcadeBadgeTone;
  }> = [
    {
      value: "multiple",
      label: t("quiz.multipleChoice"),
      tone: "primary",
    },
    {
      value: "truefalse",
      label: t("quiz.trueFalse"),
      tone: "secondary",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "create"
          ? t("quiz.modals.createTitle")
          : t("quiz.modals.editTitle")
      }
      description={t("quiz.modals.description")}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("quiz.cancel")}
          </SecondaryButton>
          <Button
            type="submit"
            form="question-form"
            variant="accent"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.loading")
              : mode === "create"
              ? t("quiz.save")
              : t("quiz.saveChanges")}
          </Button>
        </>
      }
    >
      <form id="question-form" onSubmit={onSubmit} {...styles.slot1}>
        <div>
          <label {...styles.slot2}>{t("quiz.questionText")}</label>
          <textarea
            value={formState.questionText}
            onChange={(event) =>
              onFieldChange("questionText", event.target.value)
            }
            rows={3}
            {...styles.slot3}
            placeholder={t("quiz.questionText")}
            required
            autoFocus
          />
        </div>

        <div>
          <label {...styles.slot2}>{t("quiz.questionType")}</label>
          <ArcadeToggleGroup
            {...styles.slot4}
            value={formState.type}
            onChange={onTypeChange}
            options={questionTypeOptions}
            size="md"
          />
        </div>

        {formState.type === "multiple" ? (
          <div {...styles.slot5}>
            {(Array.from(["A", "B", "C", "D"]) as OptionKey[]).map(
              (optionKey) => (
                <Input
                  key={optionKey}
                  type="text"
                  value={formState.options[optionKey]}
                  onChange={(event) =>
                    onOptionChange(optionKey, event.target.value)
                  }
                  label={t(`quiz.option${optionKey}`)}
                  placeholder={t("quiz.optionPlaceholder", {
                    option: optionKey,
                  })}
                />
              )
            )}
          </div>
        ) : null}

        <div>
          <label {...styles.slot2}>
            {formState.type === "multiple"
              ? t("quiz.correctAnswers")
              : t("quiz.correctAnswer")}
          </label>
          <ArcadeToggleGroup
            {...styles.slot4}
            value={formState.correctAnswer}
            onChange={onSelectCorrectAnswer}
            options={correctAnswerOptions}
            size="md"
            multiSelect={formState.type === "multiple"}
          />
        </div>

        <div {...styles.slot5}>
          <Input
            type="number"
            value={formState.timeLimit}
            onChange={(event) =>
              onFieldChange(
                "timeLimit",
                handleNumericFieldChange(event, formState.timeLimit)
              )
            }
            label={t("quiz.timeLimit")}
            min={5}
          />
          <Input
            type="number"
            value={formState.points}
            onChange={(event) =>
              onFieldChange(
                "points",
                handleNumericFieldChange(event, formState.points)
              )
            }
            label={t("quiz.points")}
            min={100}
            step={50}
          />
        </div>

        {formError ? <div {...styles.slot7}>{formError}</div> : null}
      </form>
    </Modal>
  );
}

type TranslationFn = ReturnType<typeof useTranslation>["t"];

type AnswerOption = {
  value: string;
  label: string;
  icon?: string;
  tone: ArcadeBadgeTone;
};

function buildCorrectAnswerOptions(
  type: QuestionType,
  t: TranslationFn
): AnswerOption[] {
  if (type === "multiple") {
    return [
      { value: "A", label: t("quiz.optionA"), tone: "accent" },
      { value: "B", label: t("quiz.optionB"), tone: "accent" },
      { value: "C", label: t("quiz.optionC"), tone: "accent" },
      { value: "D", label: t("quiz.optionD"), tone: "accent" },
    ];
  }

  return [
    {
      value: "true",
      label: t("quiz.trueAnswer"),
      icon: "✓",
      tone: "success",
    },
    {
      value: "false",
      label: t("quiz.falseAnswer"),
      icon: "✗",
      tone: "danger",
    },
  ];
}
