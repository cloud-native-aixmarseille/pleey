import { useEffect, useState } from 'react';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseProjectFormDialogStateParams {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly project: Project | null;
  readonly onSubmit: (values: { name: string; description: string | null }) => Promise<Project>;
  readonly onSubmitted: (project: Project) => void;
}

export function useProjectFormDialogState({
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    feedback.clearError();
  }, [isOpen, mode, project?.id]);

  async function handleSubmit() {
    feedback.clearError();

    const validationError = projectFormFacade.validateName(name);
    if (validationError) {
      feedback.setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const savedProject = await onSubmit(projectFormFacade.createInput(name, description));
      onSubmitted(savedProject);
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage:
          mode === 'create' ? 'project.errors.createFailed' : 'project.errors.updateFailed',
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
    setDescription,
    setName,
  };
}
