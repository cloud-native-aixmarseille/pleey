import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
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
      <form id="question-form" onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
            {t("quiz.questionText")}
          </label>
          <textarea
            value={formState.questionText}
            onChange={(event) =>
              onFieldChange("questionText", event.target.value)
            }
            rows={3}
            className="mt-2 w-full rounded-3xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none"
            placeholder={t("quiz.questionText")}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
            {t("quiz.questionType")}
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onTypeChange("multiple")}
              className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                formState.type === "multiple"
                  ? "border-primary-400 bg-primary-500/20 text-primary-200 shadow-glow"
                  : "border-primary-500/20 bg-dark-500/40 text-light-400 hover:border-primary-400/40 hover:text-light-100"
              }`}
            >
              {t("quiz.multipleChoice")}
            </button>
            <button
              type="button"
              onClick={() => onTypeChange("truefalse")}
              className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                formState.type === "truefalse"
                  ? "border-secondary-400 bg-secondary-500/20 text-secondary-200 shadow-glow"
                  : "border-secondary-500/20 bg-dark-500/40 text-light-400 hover:border-secondary-400/40 hover:text-light-100"
              }`}
            >
              {t("quiz.trueFalse")}
            </button>
          </div>
        </div>

        {formState.type === "multiple" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
            {t("quiz.correctAnswer")}
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            {correctAnswerOptions.map(({ value, label, icon }) => {
              const isActive = formState.correctAnswer === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSelectCorrectAnswer(value)}
                  className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                    isActive
                      ? "border-accent-400 bg-accent-500/20 text-accent-100 shadow-glow"
                      : "border-accent-500/20 bg-dark-500/40 text-light-300 hover:border-accent-400/40 hover:text-light-100"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex items-center gap-2">
                    {icon ? <span aria-hidden>{icon}</span> : null}
                    <span>{label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="rounded-2xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-200 shadow-neon-secondary">
            {formError}
          </div>
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
};

function buildCorrectAnswerOptions(
  type: QuestionType,
  t: TranslationFn
): AnswerOption[] {
  if (type === "multiple") {
    return [
      { value: "A", label: t("quiz.optionA") },
      { value: "B", label: t("quiz.optionB") },
      { value: "C", label: t("quiz.optionC") },
      { value: "D", label: t("quiz.optionD") },
    ];
  }

  return [
    { value: "true", label: t("quiz.trueAnswer"), icon: "✓" },
    { value: "false", label: t("quiz.falseAnswer"), icon: "✗" },
  ];
}
