import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../../../../shared/components";
import type { Question, Quiz } from "../../../../shared/types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../domains/quiz/quiz.service";
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
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("ManageQuestionsPage", {
  slot1: "min-h-screen bg-game-gradient p-4 sm:p-8",
});


type QuestionFormMode = "create" | "edit";

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
  const [mode, setMode] = useState<QuestionFormMode>("create");
  const [formState, setFormState] = useState<QuestionFormState>(
    createDefaultQuestionFormState()
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<Question | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionCount = useMemo(() => questions.length, [questions.length]);

  const resetFormState = useCallback(() => {
    setFormState(createDefaultQuestionFormState());
    setFormError(null);
    setIsSubmitting(false);
  }, []);

  const handleOpenSessions = () => {
    navigate(`/admin/quizzes/${quiz.id}/sessions`);
  };

  const handleBack = () => {
    navigate("/admin");
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

  const handleFieldChange = useCallback(<K extends keyof QuestionFormState>(
    key: K,
    value: QuestionFormState[K]
  ) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }, []);

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
        const currentAnswer = previous.correctAnswer as OptionKey;
        const nextAnswer = validAnswers.includes(currentAnswer)
          ? currentAnswer
          : "A";

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

  const handleCorrectAnswerSelect = useCallback((value: string) => {
    setFormState((previous) => ({ ...previous, correctAnswer: value }));
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

      const selected = formState.options[formState.correctAnswer as OptionKey];

      if (!selected || !selected.trim()) {
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
    <div {...styles.slot1}>
      <Container size="lg">
        <QuestionsHeader
          quiz={quiz}
          questionCount={questionCount}
          onBack={handleBack}
          onViewSessions={handleOpenSessions}
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
    </div>
  );
}
