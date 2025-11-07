import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Quiz, Question } from "../../../shared/types";
import {
  Button,
  Card,
  Container,
  Input,
  Modal,
} from "../../../shared/components";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../domains/quiz/quiz.service";

interface QuestionFormState {
  questionText: string;
  type: Question["type"];
  options: Record<"A" | "B" | "C" | "D", string>;
  correctAnswer: string;
  timeLimit: number;
  points: number;
}

const EMPTY_OPTIONS: QuestionFormState["options"] = {
  A: "",
  B: "",
  C: "",
  D: "",
};

const DEFAULT_FORM: QuestionFormState = {
  questionText: "",
  type: "multiple",
  options: EMPTY_OPTIONS,
  correctAnswer: "A",
  timeLimit: 20,
  points: 1000,
};

interface ManageQuestionsPageProps {
  quiz: Quiz;
  questions: Question[];
  onAddQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
  onDeleteQuestion: (questionId: number) => Promise<void>;
  onUpdateQuestion: (
    questionId: number,
    payload: UpdateQuestionPayload
  ) => Promise<unknown>;
}

export default function ManageQuestionsPage({
  quiz,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
}: ManageQuestionsPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [questionModalMode, setQuestionModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [questionForm, setQuestionForm] =
    useState<QuestionFormState>(DEFAULT_FORM);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionBeingEdited, setQuestionBeingEdited] =
    useState<Question | null>(null);
  const [questionPendingDeletion, setQuestionPendingDeletion] =
    useState<Question | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionModalTitle = useMemo(() => {
    return questionModalMode === "create"
      ? t("quiz.modals.createTitle")
      : t("quiz.modals.editTitle");
  }, [questionModalMode, t]);

  const resetForm = () => {
    setQuestionForm({ ...DEFAULT_FORM, options: { ...EMPTY_OPTIONS } });
    setFormError(null);
    setIsSubmitting(false);
  };

  const openCreateModal = () => {
    resetForm();
    setQuestionModalMode("create");
    setQuestionBeingEdited(null);
    setQuestionModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setQuestionModalMode("edit");
    setQuestionBeingEdited(question);
    setFormError(null);
    setIsSubmitting(false);

    if (question.type === "multiple") {
      setQuestionForm({
        questionText: question.question_text,
        type: "multiple",
        options: {
          A: question.option_a ?? "",
          B: question.option_b ?? "",
          C: question.option_c ?? "",
          D: question.option_d ?? "",
        },
        correctAnswer: question.correct_answer,
        timeLimit: question.time_limit,
        points: question.points,
      });
    } else {
      setQuestionForm({
        questionText: question.question_text,
        type: "truefalse",
        options: { ...EMPTY_OPTIONS },
        correctAnswer: question.correct_answer === "true" ? "true" : "false",
        timeLimit: question.time_limit,
        points: question.points,
      });
    }

    setQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setQuestionBeingEdited(null);
    resetForm();
  };

  const requestDeleteQuestion = (question: Question) => {
    setQuestionPendingDeletion(question);
    setIsSubmitting(false);
  };

  const cancelDeleteQuestion = () => {
    setQuestionPendingDeletion(null);
    setIsSubmitting(false);
  };

  const updateFormField = <K extends keyof QuestionFormState>(
    key: K,
    value: QuestionFormState[K]
  ) => {
    setQuestionForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateOption = (key: "A" | "B" | "C" | "D", value: string) => {
    setQuestionForm((previous) => ({
      ...previous,
      options: { ...previous.options, [key]: value },
    }));
  };

  const setQuestionType = (type: Question["type"]) => {
    setQuestionForm((previous) => {
      if (type === "multiple") {
        const nextCorrect = (["A", "B", "C", "D"] as const).includes(
          previous.correctAnswer as "A" | "B" | "C" | "D"
        )
          ? previous.correctAnswer
          : "A";

        return {
          ...previous,
          type,
          correctAnswer: nextCorrect,
        };
      }

      return {
        questionText: previous.questionText,
        type,
        options: { ...EMPTY_OPTIONS },
        correctAnswer: previous.correctAnswer === "false" ? "false" : "true",
        timeLimit: previous.timeLimit,
        points: previous.points,
      };
    });
    setFormError(null);
  };

  const validateForm = () => {
    if (!questionForm.questionText.trim()) {
      setFormError(t("quiz.formErrors.questionRequired"));
      return false;
    }

    if (questionForm.timeLimit <= 0) {
      setFormError(t("quiz.formErrors.timeLimitPositive"));
      return false;
    }

    if (questionForm.points <= 0) {
      setFormError(t("quiz.formErrors.pointsPositive"));
      return false;
    }

    if (questionForm.type === "multiple") {
      const { A, B, C, D } = questionForm.options;
      if (!A.trim() || !B.trim()) {
        setFormError(t("quiz.formErrors.optionsRequired"));
        return false;
      }

      const chosenOption =
        questionForm.options[
          questionForm.correctAnswer as "A" | "B" | "C" | "D"
        ];

      if (!chosenOption || !chosenOption.trim()) {
        setFormError(t("quiz.formErrors.correctAnswerRequired"));
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  const buildQuestionPayload = () => {
    const base = {
      questionText: questionForm.questionText.trim(),
      type: questionForm.type as CreateQuestionPayload["type"],
      timeLimit: questionForm.timeLimit,
      points: questionForm.points,
    };

    if (questionForm.type === "multiple") {
      const trimmedOptions = Object.fromEntries(
        Object.entries(questionForm.options).map(([key, value]) => [
          key,
          value.trim() || null,
        ])
      ) as Record<"A" | "B" | "C" | "D", string | null>;

      const result: Omit<CreateQuestionPayload, "quizId"> = {
        ...base,
        correctAnswer: questionForm.correctAnswer,
        optionA: trimmedOptions.A,
        optionB: trimmedOptions.B,
        optionC: trimmedOptions.C,
        optionD: trimmedOptions.D,
      };

      return result;
    }

    const result: Omit<CreateQuestionPayload, "quizId"> = {
      ...base,
      correctAnswer: questionForm.correctAnswer === "false" ? "false" : "true",
      optionA: null,
      optionB: null,
      optionC: null,
      optionD: null,
    };

    return result;
  };

  const submitQuestionForm = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = buildQuestionPayload();

    try {
      if (questionModalMode === "create") {
        const createPayload: CreateQuestionPayload = {
          quizId: quiz.id,
          ...payload,
        };
        await onAddQuestion(createPayload);
      } else if (questionBeingEdited) {
        const updatePayload: UpdateQuestionPayload = {
          ...payload,
        };
        await onUpdateQuestion(questionBeingEdited.id, updatePayload);
      }

      closeQuestionModal();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!questionPendingDeletion) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteQuestion(questionPendingDeletion.id);
      cancelDeleteQuestion();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const correctAnswerOptions: Array<{
    value: string;
    label: string;
    icon?: string;
  }> =
    questionForm.type === "multiple"
      ? [
          { value: "A", label: t("quiz.optionA") },
          { value: "B", label: t("quiz.optionB") },
          { value: "C", label: t("quiz.optionC") },
          { value: "D", label: t("quiz.optionD") },
        ]
      : [
          { value: "true", label: t("quiz.trueAnswer"), icon: "✓" },
          { value: "false", label: t("quiz.falseAnswer"), icon: "✗" },
        ];

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8">
      <Container size="lg">
        {/* Header */}
        <Card className="p-6 sm:p-8 mb-6 animate-slide-down">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 text-light-700 hover:text-primary-600 transition-colors mb-4"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">{t("quiz.back")}</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">📝</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {quiz.title}
                </h2>
              </div>
              <p className="text-light-700 mb-4">{quiz.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold">
                  {questions.length}{" "}
                  {questions.length === 1
                    ? t("quiz.question")
                    : t("quiz.questionsPlural")}
                </span>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              onClick={openCreateModal}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              {t("quiz.addQuestion")}
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-dark-800 mb-2">
              {t("quiz.noQuestionsTitle")}
            </h3>
            <p className="text-light-700 mb-6">
              {t("quiz.noQuestionsDescription")}
            </p>
            <Button variant="primary" size="lg" onClick={openCreateModal}>
              {t("quiz.addFirstQuestion")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <Card
                key={q.id}
                className={`p-6 animate-slide-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="glass-effect rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-primary-600">
                        Q{index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-dark-800 flex-1">
                      {q.question_text}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(q)}
                    >
                      {t("quiz.editQuestion")}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => requestDeleteQuestion(q)}
                      aria-label={t("quiz.deleteQuestion")}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      }
                    >
                      <span className="sr-only">
                        {t("quiz.deleteQuestion")}
                      </span>
                    </Button>
                  </div>
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2
                    ${
                      q.type === "multiple"
                        ? "bg-primary-100 text-primary-700 border border-primary-300"
                        : "bg-secondary-100 text-secondary-700 border border-secondary-300"
                    }
                  `}
                  >
                    {q.type === "multiple"
                      ? t("quiz.multipleChoiceShort")
                      : t("quiz.trueFalseShort")}
                  </span>
                </div>

                {/* Options for Multiple Choice */}
                {q.type === "multiple" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        letter: "A",
                        text: q.option_a,
                        className: "answer-option-a",
                      },
                      {
                        letter: "B",
                        text: q.option_b,
                        className: "answer-option-b",
                      },
                      {
                        letter: "C",
                        text: q.option_c,
                        className: "answer-option-c",
                      },
                      {
                        letter: "D",
                        text: q.option_d,
                        className: "answer-option-d",
                      },
                    ].map((option) => (
                      <div
                        key={option.letter}
                        className={`
                          p-3 rounded-xl transition-all
                          ${
                            q.correct_answer === option.letter
                              ? "bg-success-100 border-2 border-success-500 ring-2 ring-success-200"
                              : "bg-light-100 border-2 border-light-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-dark-700">
                            {option.letter}:
                          </span>
                          <span className="text-dark-800">{option.text}</span>
                          {q.correct_answer === option.letter && (
                            <span className="ml-auto text-success-600">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer for True/False */}
                {q.type === "truefalse" && (
                  <div className="mb-4">
                    <div className="glass-effect rounded-xl p-4 inline-flex items-center gap-2">
                      <span className="text-2xl">
                        {q.correct_answer === "true" ? "✓" : "✗"}
                      </span>
                      <span className="font-bold text-dark-800">
                        {t("quiz.correctAnswer")}:{" "}
                        {q.correct_answer === "true"
                          ? t("quiz.trueAnswer")
                          : t("quiz.falseAnswer")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Question Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="font-semibold text-dark-700">
                      {q.time_limit}s
                    </span>
                  </div>
                  <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
                    <span>🏆</span>
                    <span className="font-semibold text-dark-700">
                      {q.points} points
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>

      <Modal
        isOpen={questionModalOpen}
        onClose={closeQuestionModal}
        title={questionModalTitle}
        description={t("quiz.modals.description")}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeQuestionModal}
              disabled={isSubmitting}
            >
              {t("quiz.cancel")}
            </Button>
            <Button
              type="submit"
              form="question-form"
              variant="accent"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("common.loading")
                : questionModalMode === "create"
                ? t("quiz.save")
                : t("quiz.saveChanges")}
            </Button>
          </>
        }
      >
        <form
          id="question-form"
          onSubmit={submitQuestionForm}
          className="space-y-6"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
              {t("quiz.questionText")}
            </label>
            <textarea
              value={questionForm.questionText}
              onChange={(event) =>
                updateFormField("questionText", event.target.value)
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
                onClick={() => setQuestionType("multiple")}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                  questionForm.type === "multiple"
                    ? "border-primary-400 bg-primary-500/20 text-primary-200 shadow-glow"
                    : "border-primary-500/20 bg-dark-500/40 text-light-400 hover:border-primary-400/40 hover:text-light-100"
                }`}
              >
                {t("quiz.multipleChoice")}
              </button>
              <button
                type="button"
                onClick={() => setQuestionType("truefalse")}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                  questionForm.type === "truefalse"
                    ? "border-secondary-400 bg-secondary-500/20 text-secondary-200 shadow-glow"
                    : "border-secondary-500/20 bg-dark-500/40 text-light-400 hover:border-secondary-400/40 hover:text-light-100"
                }`}
              >
                {t("quiz.trueFalse")}
              </button>
            </div>
          </div>

          {questionForm.type === "multiple" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["A", "B", "C", "D"] as const).map((optionKey) => (
                <Input
                  key={optionKey}
                  type="text"
                  value={questionForm.options[optionKey]}
                  onChange={(event) =>
                    updateOption(optionKey, event.target.value)
                  }
                  label={t(`quiz.option${optionKey}`)}
                  placeholder={t("quiz.optionPlaceholder", {
                    option: optionKey,
                  })}
                />
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
              {t("quiz.correctAnswer")}
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              {correctAnswerOptions.map(({ value, label, icon }) => {
                const isActive = questionForm.correctAnswer === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateFormField("correctAnswer", value)}
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
              value={questionForm.timeLimit}
              onChange={(event) =>
                updateFormField("timeLimit", Number(event.target.value))
              }
              label={t("quiz.timeLimit")}
              min={5}
            />
            <Input
              type="number"
              value={questionForm.points}
              onChange={(event) =>
                updateFormField("points", Number(event.target.value))
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

      <Modal
        isOpen={questionPendingDeletion !== null}
        onClose={cancelDeleteQuestion}
        title={t("quiz.modals.deleteTitle")}
        description={t("quiz.modals.deleteDescription")}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelDeleteQuestion}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("common.loading") : t("quiz.deleteQuestion")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-light-200">
          {t("quiz.modals.deletePrompt", {
            question: questionPendingDeletion?.question_text ?? "",
          })}
        </p>
      </Modal>
    </div>
  );
}
