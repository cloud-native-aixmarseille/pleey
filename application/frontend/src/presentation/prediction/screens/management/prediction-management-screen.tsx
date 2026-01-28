import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import type {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from '../../../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../../../domains/prediction/entities/prediction-prompt';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { usePresentationNavigate, usePresentationParams } from '../../../shared/routing/router';
import { Button } from '../../../shared/ui/actions/button';
import { LoadingState } from '../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { StatusBannerGroup } from '../../../shared/ui/feedback/status-banner-group';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { ConfirmDialog } from '../../../shared/ui/overlay/confirm-dialog';
import { formatDate } from '../../../workspace/dashboard/helpers/format-date';
import { PredictionManagementContextBar } from './components/prediction-management-context-bar';
import { PredictionManagementHeader } from './components/prediction-management-header';
import { PredictionManagementMetadataSection } from './components/prediction-management-metadata-section';
import { PredictionPromptForm } from './prediction-prompt-form';
import { PredictionPromptList } from './prediction-prompt-list';
import { usePredictionManagementState } from './use-prediction-management-state';

interface PredictionManagementScreenProps {
  readonly createGameSession: (gameId: number) => Promise<DashboardActiveSessionItem>;
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly loadPredictionManagementData: (predictionId: number) => Promise<{
    readonly predictionGame: DashboardGameListItem | null;
    readonly prompts: PredictionPrompt[];
  }>;
  readonly createPredictionPrompt: (
    input: CreatePredictionPromptInput,
  ) => Promise<PredictionPrompt>;
  readonly updatePredictionPrompt: (
    promptId: number,
    input: UpdatePredictionPromptInput,
  ) => Promise<PredictionPrompt>;
  readonly deletePredictionPrompt: (promptId: number) => Promise<void>;
}

export function PredictionManagementScreen({
  createGameSession,
  loadActiveSessions,
  loadPredictionManagementData,
  createPredictionPrompt,
  updatePredictionPrompt,
  deletePredictionPrompt,
}: PredictionManagementScreenProps) {
  const { currentLanguage, t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { predictionId } = usePresentationParams<'predictionId'>();
  const resolvedPredictionId = Number.parseInt(predictionId ?? '', 10);
  const handleBackToDashboard = () => {
    navigate('/workspace/dashboard');
  };
  const {
    predictionGame,
    sortedPrompts,
    formState,
    setFormState,
    editingPromptId,
    isLoading,
    isSubmittingPrompt,
    errorMessage,
    successMessage,
    dialogState,
    confirm,
    cancel,
    handlePromptSubmit,
    handleEditPrompt,
    handleCancelEdit,
    handleDeletePrompt,
  } = usePredictionManagementState({
    resolvedPredictionId,
    loadPredictionManagementData,
    createPredictionPrompt,
    updatePredictionPrompt,
    deletePredictionPrompt,
  });

  if (isLoading) {
    return <LoadingState variant="editor">{t('common.loading')}</LoadingState>;
  }

  if (!predictionGame) {
    return (
      <>
        <StatusBanner tone="error">{t('prediction.management.predictionMissing')}</StatusBanner>
        <Button intent="outline" onClick={handleBackToDashboard}>
          {t('prediction.management.backAction')}
        </Button>
      </>
    );
  }

  return (
    <ContentStack gap="xl">
      <PredictionManagementHeader
        backActionLabel={t('prediction.management.backAction')}
        createGameSession={createGameSession}
        eyebrow={t('prediction.management.eyebrow')}
        game={predictionGame}
        loadActiveSessions={loadActiveSessions}
        onBack={handleBackToDashboard}
        subtitle={t('prediction.management.subtitle')}
        title={t('prediction.management.title')}
      />

      <PredictionManagementContextBar
        predictionTitle={predictionGame.title}
        promptCount={sortedPrompts.length}
        createdAt={predictionGame.createdAt}
      />

      <StatusBannerGroup
        error={errorMessage ? t(errorMessage) : null}
        success={successMessage ? t(successMessage) : null}
      />

      <PredictionManagementMetadataSection
        createdAtText={t('prediction.management.createdAt', {
          date: formatDate(predictionGame.createdAt, currentLanguage),
        })}
        description={t('prediction.management.metadataDescription')}
        fallbackDescription={t('dashboard.games.noDescription')}
        game={predictionGame}
        title={t('prediction.management.metadataTitle')}
      />

      <PredictionPromptForm
        formState={formState}
        setFormState={setFormState}
        editingPromptId={editingPromptId}
        isSubmitting={isSubmittingPrompt}
        onSubmit={handlePromptSubmit}
        onCancelEdit={handleCancelEdit}
      />

      <PredictionPromptList
        prompts={sortedPrompts}
        onEdit={handleEditPrompt}
        onDelete={handleDeletePrompt}
      />

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        message={dialogState.message}
        confirmLabel={t('prediction.management.deleteAction')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </ContentStack>
  );
}
