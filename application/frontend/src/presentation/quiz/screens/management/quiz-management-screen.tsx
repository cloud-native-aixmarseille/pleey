import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import type { Quiz } from '../../../../domains/quiz/entities/quiz';
import type {
  CreateQuizQuestionInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../../domains/quiz/entities/quiz-question';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { usePresentationNavigate, usePresentationParams } from '../../../shared/routing/router';
import { Button } from '../../../shared/ui/actions/button';
import { LoadingState } from '../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { StatusBannerGroup } from '../../../shared/ui/feedback/status-banner-group';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { ConfirmDialog } from '../../../shared/ui/overlay/confirm-dialog';
import { QuizManagementContextBar } from './components/quiz-management-context-bar';
import { QuizManagementHeader } from './components/quiz-management-header';
import { QuizManagementQuestionsSection } from './components/quiz-management-questions-section';
import { QuizMetadataForm } from './components/quiz-metadata-form';
import { QuizQuestionDialog } from './components/quiz-question-dialog';
import { QuizQuestionList } from './quiz-question-list';
import { useQuizManagementState } from './use-quiz-management-state';

interface QuizManagementScreenProps {
  readonly createGameSession: (gameId: number) => Promise<DashboardActiveSessionItem>;
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly loadQuizManagementData: (quizId: number) => Promise<{
    readonly quiz: Quiz | null;
    readonly questions: QuizQuestion[];
  }>;
  readonly updateQuiz: (quizId: number, input: UpdateQuizInput) => Promise<Quiz>;
  readonly createQuizQuestion: (input: CreateQuizQuestionInput) => Promise<QuizQuestion>;
  readonly updateQuizQuestion: (
    questionId: number,
    input: UpdateQuizQuestionInput,
  ) => Promise<QuizQuestion>;
  readonly deleteQuizQuestion: (questionId: number) => Promise<void>;
}

export function QuizManagementScreen({
  createGameSession,
  loadActiveSessions,
  loadQuizManagementData,
  updateQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
}: QuizManagementScreenProps) {
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { quizId } = usePresentationParams<'quizId'>();
  const resolvedQuizId = Number.parseInt(quizId ?? '', 10);
  const handleBackToDashboard = () => {
    navigate('/workspace/dashboard');
  };
  const {
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
  } = useQuizManagementState({
    resolvedQuizId,
    loadQuizManagementData,
    createQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
  });

  if (isLoading) {
    return <LoadingState variant="editor">{t('common.loading')}</LoadingState>;
  }

  if (!quiz) {
    return (
      <>
        <StatusBanner tone="error">{t('quiz.management.quizMissing')}</StatusBanner>
        <Button intent="outline" onClick={handleBackToDashboard}>
          {t('quiz.management.backAction')}
        </Button>
      </>
    );
  }

  return (
    <ContentStack gap="xl">
      <QuizManagementHeader
        backActionLabel={t('quiz.management.backAction')}
        createGameSession={createGameSession}
        eyebrow={t('quiz.management.eyebrow')}
        loadActiveSessions={loadActiveSessions}
        onBack={handleBackToDashboard}
        quiz={quiz}
        subtitle={t('quiz.management.subtitle')}
        title={t('quiz.management.title')}
      />

      <QuizManagementContextBar
        quizTitle={quiz.title}
        questionCount={sortedQuestions.length}
        createdAt={quiz.createdAt}
      />

      <QuizMetadataForm quiz={quiz} onSave={updateQuiz} onSaved={handleMetadataSaved} />

      <StatusBannerGroup
        error={errorMessage ? t(errorMessage) : null}
        success={successMessage ? t(successMessage) : null}
      />

      <QuizManagementQuestionsSection
        createQuestionLabel={t('quiz.management.createQuestionAction')}
        description={t('quiz.management.questionsDescription')}
        eyebrow={t('quiz.management.eyebrow')}
        onCreateQuestion={handleOpenCreateQuestionDialog}
        summary={t('quiz.management.questionSummary', { count: String(sortedQuestions.length) })}
        title={t('quiz.management.questionsTitle')}
      />

      <QuizQuestionList
        title={quiz.title}
        description={quiz.description ?? undefined}
        questions={sortedQuestions}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteQuestion}
      />

      <QuizQuestionDialog
        isOpen={isQuestionDialogOpen}
        title={
          editingQuestionId === null
            ? t('quiz.management.createQuestionAction')
            : t('quiz.management.updateQuestionAction')
        }
        errorMessage={errorMessage ? t(errorMessage) : null}
        formState={formState}
        setFormState={setFormState}
        editingQuestionId={editingQuestionId}
        isSubmitting={isSubmittingQuestion}
        onSubmit={handleQuestionSubmit}
        onCancelEdit={handleCloseQuestionDialog}
        onClose={handleCloseQuestionDialog}
      />

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        message={dialogState.message}
        confirmLabel={t('quiz.management.deleteQuestionAction')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </ContentStack>
  );
}
