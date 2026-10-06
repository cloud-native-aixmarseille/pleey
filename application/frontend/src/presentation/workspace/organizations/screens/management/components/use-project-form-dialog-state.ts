import { useEffect, useState } from 'react';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { Project } from '../../../../../../domains/project/entities/project';
import type { ThemeId } from '../../../../../../domains/theme/entities/theme-id';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseProjectFormDialogStateParams {
  readonly organizationDefaultPartySettings: PartySettings;
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly project: Project | null;
  readonly onSubmit: (values: {
    name: string;
    description: string | null;
    defaultPartySettings: PartySettings;
    defaultThemeId: ThemeId | null;
  }) => Promise<Project>;
  readonly onSubmitted: (project: Project) => void;
}

export function useProjectFormDialogState({
  organizationDefaultPartySettings,
  isOpen,
  mode,
  project,
  onSubmit,
  onSubmitted,
}: UseProjectFormDialogStateParams) {
  const { projectFormFacade } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const [name, setName] = useState('');
  const [defaultThemeId, setDefaultThemeId] = useState<ThemeId | null>(null);
  const [description, setDescription] = useState('');
  const [defaultPartySettings, setDefaultPartySettings] = useState<PartySettings>(DEFAULT_PARTY_SETTINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setDefaultThemeId(project?.defaultThemeId ?? null);
    setDescription(project?.description ?? '');
    setDefaultPartySettings(project?.defaultPartySettings ?? organizationDefaultPartySettings);
    feedback.clearError();
  }, [
    organizationDefaultPartySettings,
    isOpen,
    mode,
    project?.defaultPartySettings,
    project?.id,
    project?.defaultThemeId,
  ]);

  async function handleSubmit() {
    feedback.clearError();

    const validationError = projectFormFacade.validateName(name);
    if (validationError) {
      feedback.setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const input = projectFormFacade.createInput(name, description, defaultPartySettings, defaultThemeId);
      const savedProject = await onSubmit({
        name: input.name,
        description: input.description,
        defaultPartySettings,
        defaultThemeId: input.defaultThemeId,
      });
      onSubmitted(savedProject);
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: mode === 'create' ? 'project.errors.createFailed' : 'project.errors.updateFailed',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    description,
    errorMessage: feedback.errorMessage,
    handleSubmit,
    isSubmitting,
    name,
    defaultPartySettings,
    setDescription,
    setName,
    setDefaultPartySettings,
    defaultThemeId,
    setDefaultThemeId,
  };
}
