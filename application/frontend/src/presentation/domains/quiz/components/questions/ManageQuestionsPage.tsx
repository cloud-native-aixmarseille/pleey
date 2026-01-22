import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../../../../../presentation/shared/ui/components";
import type { Question, Quiz } from "../../../../../domains/quiz/types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../../domains/quiz/quiz.payloads";
import {
  createDefaultQuestionFormState,
  createEmptyOptions,
  buildFormStateFromQuestion,
  toCreatePayload,
  toUpdatePayload,
  type OptionKey,
  type QuestionFormState,
  type QuestionType,
} from "./questionFormState";
import { QuestionsHeader } from "./components/QuestionsHeader";
import { QuestionsEmptyState } from "./components/QuestionsEmptyState";
import { QuestionList } from "./components/QuestionList";
import { QuestionFormModal } from "./components/QuestionFormModal";
import { QuestionDeleteModal } from "./components/QuestionDeleteModal";
import { EditQuizTitleModal } from "../modals/EditQuizTitleModal";

const QUESTION_PAGE_WRAPPER_CLASSES =
  "min-h-[calc(100dvh-var(--app-shell-padding-top,0px)-var(--app-shell-padding-bottom,0px))] bg-game-gradient pt-0 px-4 pb-4 sm:px-8 sm:pb-8";

type QuestionFormMode = "create" | "edit";

interface ManageQuestionsPageProps {
  quiz: Quiz;
  questions: Question[];
  onAddQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
  onDeleteQuestion: (questionId: number) => Promise<void>;
  onUpdateQuestion: (
    questionId: number,
    payload: UpdateQuestionPayload,
  ) => Promise<unknown>;
  onUpdateQuizTitle: (title: string) => Promise<unknown>;
}

export default function ManageQuestionsPage({
  quiz,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onUpdateQuizTitle,
}: ManageQuestionsPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState<QuestionFormMode>("create");
  const [formState, setFormState] = useState<QuestionFormState>(
    createDefaultQuestionFormState(),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<Question | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [quizTitleDraft, setQuizTitleDraft] = useState(quiz.title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const questionCount = useMemo(() => questions.length, [questions.length]);

  const resetFormState = useCallback(() => {
    setFormState(createDefaultQuestionFormState());
    setFormError(null);
    setIsSubmitting(false);
  }, []);

  const handleOpenSessions = () => {
    navigate(`/admin/quizzes/${quiz.id}/sessions`);
  };

  const handleOpenEditTitle = () => {
    setQuizTitleDraft(quiz.title);
    setIsSavingTitle(false);
    setIsEditTitleOpen(true);
  };

  const handleCloseEditTitle = () => {
    setIsEditTitleOpen(false);
    setIsSavingTitle(false);
  };

  const handleBack = () => {
    navigate("/admin");
  };

  const handleQuizTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setQuizTitleDraft(event.target.value);
  };

  const handleSubmitQuizTitle = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!quizTitleDraft.trim()) {
      return;
    }

    try {
      setIsSavingTitle(true);
      await onUpdateQuizTitle(quizTitleDraft.trim());
      handleCloseEditTitle();
    } catch {
      setIsSavingTitle(false);
    }
  };

  const handleOpenCreate = () => {
    resetFormState();
    setMode("create");
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (question: Question) => {
    setMode("edit");
    setEditingQuestion(question);
    setFormState(buildFormStateFromQuestion(question));
    setFormError(null);
    setIsSubmitting(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    resetFormState();
  }, [resetFormState]);

  const handleFieldChange = useCallback(
    <K extends keyof QuestionFormState>(
      key: K,
      value: QuestionFormState[K],
    ) => {
      setFormState((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const handleOptionChange = useCallback((key: OptionKey, value: string) => {
    setFormState((previous) => ({
      ...previous,
      options: { ...previous.options, [key]: value },
    }));
  }, []);

  const handleTypeChange = useCallback((type: QuestionType) => {
    setFormState((previous) => {
      if (type === "multiple") {
        const validAnswers: OptionKey[] = ["A", "B", "C", "D"];
        // Handle multiple answers: keep first valid answer from comma-separated list
        const currentAnswers = previous.correctAnswer
          .split(",")
          .map((a) => a.trim() as OptionKey);
        const firstValidAnswer = currentAnswers.find((a) =>
          validAnswers.includes(a),
        );
        const nextAnswer = firstValidAnswer || "A";

        return {
          ...previous,
          type,
          options: { ...previous.options },
          correctAnswer: nextAnswer,
        };
      }

      return {
        questionText: previous.questionText,
        type,
        options: createEmptyOptions(),
        correctAnswer: previous.correctAnswer === "false" ? "false" : "true",
        timeLimit: previous.timeLimit,
        points: previous.points,
      };
    });
    setFormError(null);
  }, []);

  const handleCorrectAnswerSelect = useCallback((value: string | null) => {
    setFormState((previous) => ({ ...previous, correctAnswer: value ?? "" }));
  }, []);

  const validateForm = () => {
    if (!formState.questionText.trim()) {
      setFormError(t("quiz.formErrors.questionRequired"));
      return false;
    }

    if (formState.timeLimit <= 0) {
      setFormError(t("quiz.formErrors.timeLimitPositive"));
      return false;
    }

    if (formState.points <= 0) {
      setFormError(t("quiz.formErrors.pointsPositive"));
      return false;
    }

    if (formState.type === "multiple") {
      const { A, B } = formState.options;
      if (!A.trim() || !B.trim()) {
        setFormError(t("quiz.formErrors.optionsRequired"));
        return false;
      }

      // Verify that correct answer(s) have been selected and each selected option is not empty
      if (!formState.correctAnswer.trim()) {
        setFormError(t("quiz.formErrors.correctAnswerRequired"));
        return false;
      }
      const correctAnswers = formState.correctAnswer
        .split(",")
        .map((a) => a.trim());

      for (const answer of correctAnswers) {
        const selected = formState.options[answer as OptionKey];
        if (!selected || !selected.trim()) {
          setFormError(t("quiz.formErrors.correctAnswerRequired"));
          return false;
        }
      }
    } else if (formState.type === "truefalse") {
      // Verify that a correct answer has been selected for true/false questions
      if (!formState.correctAnswer || !formState.correctAnswer.trim()) {
        setFormError(t("quiz.formErrors.correctAnswerRequired"));
        return false;
      }

      // Ensure the answer is either "true" or "false"
      if (
        formState.correctAnswer !== "true" &&
        formState.correctAnswer !== "false"
      ) {
        setFormError(t("quiz.formErrors.correctAnswerRequired"));
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const payload = toCreatePayload(formState, quiz.id);
        await onAddQuestion(payload);
      } else if (editingQuestion) {
        const payload = toUpdatePayload(formState);
        await onUpdateQuestion(editingQuestion.id, payload);
      }

      handleCloseForm();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleRequestDelete = (question: Question) => {
    setPendingDeletion(question);
    setIsSubmitting(false);
  };

  const handleCancelDelete = () => {
    setPendingDeletion(null);
    setIsSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeletion) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteQuestion(pendingDeletion.id);
      handleCancelDelete();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={QUESTION_PAGE_WRAPPER_CLASSES} data-questions-page="true">
      <Container size="lg">
        <QuestionsHeader
          quiz={quiz}
          questionCount={questionCount}
          onBack={handleBack}
          onViewSessions={handleOpenSessions}
          onEditQuizTitle={handleOpenEditTitle}
          onAddQuestion={handleOpenCreate}
        />

        {questions.length === 0 ? (
          <QuestionsEmptyState onAddQuestion={handleOpenCreate} />
        ) : (
          <QuestionList
            questions={questions}
            onEdit={handleOpenEdit}
            onDelete={handleRequestDelete}
          />
        )}
      </Container>

      <QuestionFormModal
        isOpen={isFormOpen}
        mode={mode}
        formState={formState}
        isSubmitting={isSubmitting}
        formError={formError}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        onOptionChange={handleOptionChange}
        onTypeChange={handleTypeChange}
        onSelectCorrectAnswer={handleCorrectAnswerSelect}
      />

      <QuestionDeleteModal
        question={pendingDeletion}
        isProcessing={isSubmitting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <EditQuizTitleModal
        isOpen={isEditTitleOpen}
        isProcessing={isSavingTitle}
        title={quizTitleDraft}
        onClose={handleCloseEditTitle}
        onSubmit={handleSubmitQuizTitle}
        onTitleChange={handleQuizTitleChange}
      />
    </div>
  );
}
