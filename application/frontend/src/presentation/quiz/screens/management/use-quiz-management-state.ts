import { useEffect, useMemo, useState } from 'react';
import { QuizQuestionManagementFacade } from '../../../../application/quiz-management/facades/quiz-question-management.facade';
import type { Quiz } from '../../../../domains/quiz/entities/quiz';
import type {
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
} from '../../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../../domains/quiz/entities/quiz-question';
import type { QuestionFormState } from '../../../../domains/quiz/entities/quiz-question-form-state';
import { useRuntimeDependency } from '../../../shared/di/use-runtime-dependency';
import { useConfirmDialog } from '../../../shared/ui/overlay/use-confirm-dialog';

interface UseQuizManagementStateParams {
  readonly resolvedQuizId: number;
  readonly loadQuizManagementData: (quizId: number) => Promise<{
    readonly quiz: Quiz | null;
    readonly questions: QuizQuestion[];
  }>;
  readonly createQuizQuestion: (input: CreateQuizQuestionInput) => Promise<QuizQuestion>;
  readonly updateQuizQuestion: (
    questionId: number,
    input: UpdateQuizQuestionInput,
  ) => Promise<QuizQuestion>;
  readonly deleteQuizQuestion: (questionId: number) => Promise<void>;
}

export function useQuizManagementState({
  resolvedQuizId,
  loadQuizManagementData,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
}: UseQuizManagementStateParams) {
  const quizQuestionManagementFacade = useRuntimeDependency(QuizQuestionManagementFacade);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [formState, setFormState] = useState<QuestionFormState>(
    quizQuestionManagementFacade.createDefaultFormState(),
  );
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { dialogState, requestConfirmation, confirm, cancel } = useConfirmDialog();

  useEffect(() => {
    if (!Number.isFinite(resolvedQuizId)) {
      setIsLoading(false);
      setQuiz(null);
      setQuestions([]);
      return;
    }

    let ignore = false;

    const loadManagementData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { quiz: loadedQuiz, questions: loadedQuestions } =
          await loadQuizManagementData(resolvedQuizId);

        if (ignore) {
          return;
        }

        if (!loadedQuiz) {
          setQuiz(null);
          setQuestions([]);
          return;
        }

        setQuiz(loadedQuiz);
        setQuestions(loadedQuestions);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error ? error.message : 'quiz.errors.questionLoadFailed',
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadManagementData();

    return () => {
      ignore = true;
    };
  }, [loadQuizManagementData, resolvedQuizId]);

  const sortedQuestions = useMemo(
    () => [...questions].sort((left, right) => left.position - right.position),
    [questions],
  );

  const resetQuestionManagement = () => {
    setEditingQuestionId(null);
    setFormState(quizQuestionManagementFacade.createDefaultFormState());
  };

  const handleMetadataSaved = (updatedQuiz: Quiz) => {
    setQuiz(updatedQuiz);
  };

  const handleOpenCreateQuestionDialog = () => {
    resetQuestionManagement();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsQuestionDialogOpen(true);
  };

  const handleCloseQuestionDialog = () => {
    setIsQuestionDialogOpen(false);
    resetQuestionManagement();
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quiz) {
      return;
    }

    const validationError = quizQuestionManagementFacade.validateForm(formState);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmittingQuestion(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = quizQuestionManagementFacade.createPayload(
        formState,
        quiz.id,
        sortedQuestions.length + 1,
      );

      if (editingQuestionId === null) {
        const createdQuestion = await createQuizQuestion(payload);
        setQuestions((current) => [...current, createdQuestion]);
        setSuccessMessage('quiz.success.questionCreated');
      } else {
        const updatedQuestion = await updateQuizQuestion(editingQuestionId, payload);
        setQuestions((current) =>
          current.map((question) =>
            question.id === updatedQuestion.id ? updatedQuestion : question,
          ),
        );
        setSuccessMessage('quiz.success.questionUpdated');
      }

      setFormState(quizQuestionManagementFacade.createDefaultFormState());
      setEditingQuestionId(null);
      setIsQuestionDialogOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : editingQuestionId === null
            ? 'quiz.errors.questionCreateFailed'
            : 'quiz.errors.questionUpdateFailed',
      );
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestionId(question.id);
    setFormState(quizQuestionManagementFacade.createFormState(question));
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (question: QuizQuestion) => {
    const confirmed = await requestConfirmation(question.questionText);

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteQuizQuestion(question.id);
      setQuestions((current) => current.filter((item) => item.id !== question.id));
      setSuccessMessage('quiz.success.questionDeleted');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'quiz.errors.questionDeleteFailed');
    }
  };

  return {
    quiz,
    sortedQuestions,
    formState,
    setFormState,
    editingQuestionId,
    isQuestionDialogOpen,
    isLoading,
    isSubmittingQuestion,
    errorMessage,
    successMessage,
    dialogState,
    confirm,
    cancel,
    handleMetadataSaved,
    handleOpenCreateQuestionDialog,
    handleCloseQuestionDialog,
    handleQuestionSubmit,
    handleEditQuestion,
    handleDeleteQuestion,
  };
}
