import { useEffect, useMemo, useState } from 'react';
import { PredictionPromptManagementFacade } from '../../../../application/prediction-management/facades/prediction-prompt-management.facade';
import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from '../../../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../../../domains/prediction/entities/prediction-prompt';
import type { PromptFormState } from '../../../../domains/prediction/entities/prediction-prompt-form-state';
import { useRuntimeDependency } from '../../../shared/di/use-runtime-dependency';
import { useConfirmDialog } from '../../../shared/ui/overlay/use-confirm-dialog';

interface UsePredictionManagementStateParams {
  readonly resolvedPredictionId: number;
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

export function usePredictionManagementState({
  resolvedPredictionId,
  loadPredictionManagementData,
  createPredictionPrompt,
  updatePredictionPrompt,
  deletePredictionPrompt,
}: UsePredictionManagementStateParams) {
  const predictionPromptManagementFacade = useRuntimeDependency(PredictionPromptManagementFacade);
  const [predictionGame, setPredictionGame] = useState<DashboardGameListItem | null>(null);
  const [prompts, setPrompts] = useState<PredictionPrompt[]>([]);
  const [formState, setFormState] = useState<PromptFormState>(() =>
    predictionPromptManagementFacade.createDefaultFormState(),
  );
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { dialogState, requestConfirmation, confirm, cancel } = useConfirmDialog();

  useEffect(() => {
    if (!Number.isFinite(resolvedPredictionId)) {
      setIsLoading(false);
      setPredictionGame(null);
      setPrompts([]);
      return;
    }

    let ignore = false;

    const loadManagementData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { predictionGame: nextPredictionGame, prompts: loadedPrompts } =
          await loadPredictionManagementData(resolvedPredictionId);

        if (ignore) {
          return;
        }

        setPredictionGame(nextPredictionGame);
        setPrompts(loadedPrompts);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error ? error.message : 'prediction.errors.promptLoadFailed',
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
  }, [loadPredictionManagementData, resolvedPredictionId]);

  const sortedPrompts = useMemo(
    () => [...prompts].sort((left, right) => left.position - right.position),
    [prompts],
  );

  const resetPromptManagement = () => {
    setEditingPromptId(null);
    setFormState(predictionPromptManagementFacade.createDefaultFormState());
  };

  const handlePromptSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!predictionGame) {
      return;
    }

    const validationError = predictionPromptManagementFacade.validateForm(formState);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const editingPrompt = prompts.find((prompt) => prompt.id === editingPromptId) ?? null;

    setIsSubmittingPrompt(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = predictionPromptManagementFacade.createPayload(
        formState,
        predictionGame.relatedGameId ?? predictionGame.gameId,
        editingPrompt?.position ?? sortedPrompts.length + 1,
        editingPrompt?.options,
      );

      if (editingPromptId === null) {
        const createdPrompt = await createPredictionPrompt(payload);
        setPrompts((current) => [...current, createdPrompt]);
        setSuccessMessage('prediction.success.promptCreated');
      } else {
        const updatedPrompt = await updatePredictionPrompt(editingPromptId, payload);
        setPrompts((current) =>
          current.map((prompt) => (prompt.id === updatedPrompt.id ? updatedPrompt : prompt)),
        );
        setSuccessMessage('prediction.success.promptUpdated');
      }

      resetPromptManagement();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : editingPromptId === null
            ? 'prediction.errors.promptCreateFailed'
            : 'prediction.errors.promptUpdateFailed',
      );
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  const handleEditPrompt = (prompt: PredictionPrompt) => {
    setEditingPromptId(prompt.id);
    setFormState(predictionPromptManagementFacade.createFormState(prompt));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleCancelEdit = () => {
    resetPromptManagement();
  };

  const handleDeletePrompt = async (prompt: PredictionPrompt) => {
    const confirmed = await requestConfirmation(prompt.promptText);

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deletePredictionPrompt(prompt.id);
      setPrompts((current) => current.filter((item) => item.id !== prompt.id));
      setSuccessMessage('prediction.success.promptDeleted');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'prediction.errors.promptDeleteFailed',
      );
    }
  };

  return {
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
  };
}
