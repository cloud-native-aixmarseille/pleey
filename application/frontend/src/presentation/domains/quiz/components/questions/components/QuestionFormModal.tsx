import { useEffect, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  ArcadeToggleGroup,
  CancelButton,
  Input,
  Modal,
  SaveButton,
} from "../../../../../../presentation/shared/ui/components";
import type {
  OptionKey,
  QuestionFormState,
  QuestionType,
} from "../questionFormState";
import { handleNumericFieldChange } from "../questionFormState";
import type { ArcadeBadgeTone } from "../../../../../../presentation/shared/ui/components/ArcadeBadge";

const FORM_CLASSES = "space-y-6";
const LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-[0.3em] text-light-400";
const TEXTAREA_CLASSES =
  "mt-2 w-full rounded-3xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none";
const OPTIONS_GRID_CLASSES = "grid grid-cols-1 gap-4 md:grid-cols-2";
const ERROR_MESSAGE_CLASSES =
  "rounded-2xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-200 shadow-neon-secondary";

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
  onSelectCorrectAnswer: (value: string | null) => void;
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
  const questionTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && questionTextRef.current) {
      questionTextRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

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
          <CancelButton
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <SaveButton
            type="submit"
            form="question-form"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="question-form" onSubmit={onSubmit} className={FORM_CLASSES}>
        <div>
          <label className={LABEL_CLASSES}>{t("quiz.questionText")}</label>
          <textarea
            ref={questionTextRef}
            value={formState.questionText}
            onChange={(event) =>
              onFieldChange("questionText", event.target.value)
            }
            rows={3}
            className={TEXTAREA_CLASSES}
            placeholder={t("quiz.questionText")}
            required
          />
        </div>

        <div>
          <label className={LABEL_CLASSES}>{t("quiz.questionType")}</label>
          <ArcadeToggleGroup
            value={formState.type}
            onChange={(value) => {
              if (!value) {
                return;
              }
              onTypeChange(value);
            }}
            options={questionTypeOptions}
            size="md"
            topSpacing="md"
          />
        </div>

        {formState.type === "multiple" ? (
          <div className={OPTIONS_GRID_CLASSES}>
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
          <label className={LABEL_CLASSES}>
            {formState.type === "multiple"
              ? t("quiz.correctAnswers")
              : t("quiz.correctAnswer")}
          </label>
          <ArcadeToggleGroup
            value={formState.correctAnswer}
            onChange={onSelectCorrectAnswer}
            options={correctAnswerOptions}
            size="md"
            multiSelect={formState.type === "multiple"}
            topSpacing="md"
          />
        </div>

        <div className={OPTIONS_GRID_CLASSES}>
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

        {formError ? (
          <div className={ERROR_MESSAGE_CLASSES}>{formError}</div>
        ) : null}
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
