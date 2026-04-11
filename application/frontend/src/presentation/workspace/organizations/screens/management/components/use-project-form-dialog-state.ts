import { useEffect, useState } from 'react';
import type { Project } from '../../../../../../domains/project/entities/project';
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setErrorMessage(null);
  }, [isOpen, project]);

  async function handleSubmit() {
    setErrorMessage(null);

    const validationError = projectFormFacade.validateName(name);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const savedProject = await onSubmit(projectFormFacade.createInput(name, description));
      onSubmitted(savedProject);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : mode === 'create'
            ? 'project.errors.createFailed'
            : 'project.errors.updateFailed',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    description,
    errorMessage,
    handleSubmit,
    isSubmitting,
    name,
    setDescription,
    setName,
  };
}
