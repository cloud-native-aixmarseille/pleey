import { useEffect, useState } from 'react';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseProjectFormDialogStateParams {
  readonly defaultPartySettings: PartySettings;
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly project: Project | null;
  readonly onSubmit: (values: {
    name: string;
    description: string | null;
    partySettings: PartySettings;
  }) => Promise<Project>;
  readonly onSubmitted: (project: Project) => void;
}

export function useProjectFormDialogState({
  defaultPartySettings,
  isOpen,
  mode,
  project,
  onSubmit,
  onSubmitted,
}: UseProjectFormDialogStateParams) {
  const { projectFormFacade } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [partySettings, setPartySettings] = useState<PartySettings>(DEFAULT_PARTY_SETTINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setPartySettings(project?.defaultPartySettings ?? defaultPartySettings);
    feedback.clearError();
  }, [defaultPartySettings, isOpen, mode, project?.defaultPartySettings, project?.id]);

  async function handleSubmit() {
    feedback.clearError();

    const validationError = projectFormFacade.validateName(name);
    if (validationError) {
      feedback.setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const input = projectFormFacade.createInput(name, description, partySettings);
      const savedProject = await onSubmit({
        name: input.name,
        description: input.description,
        partySettings,
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
    partySettings,
    setDescription,
    setName,
    setPartySettings,
  };
}
