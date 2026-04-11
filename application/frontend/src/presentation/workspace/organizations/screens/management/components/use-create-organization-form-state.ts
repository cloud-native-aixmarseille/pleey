import { useState } from 'react';
import type { CreateOrganizationCommand } from '../../../../../../application/workspace/organizations/contracts/create-organization-command';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseCreateOrganizationFormStateParams {
  readonly onSubmit: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly onCreated: (organization: Organization) => void;
}

export function useCreateOrganizationFormState({
  onSubmit,
  onCreated,
}: UseCreateOrganizationFormStateParams) {
  const { organizationFormFacade } = useWorkspaceDependencies();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function resetForm() {
    setName('');
    setDescription('');
    setErrorMessage(null);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    resetForm();
  }

  function handleOpen() {
    setErrorMessage(null);
    setIsOpen(true);
  }

  async function handleSubmit() {
    setErrorMessage(null);

    const validationError = organizationFormFacade.validateName(name);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const organization = await onSubmit(
        organizationFormFacade.createCommand(name, description) as CreateOrganizationCommand,
      );

      resetForm();
      setIsOpen(false);
      onCreated(organization);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'organization.errors.createFailed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    description,
    errorMessage,
    handleClose,
    handleOpen,
    handleSubmit,
    isOpen,
    isSubmitting,
    name,
    setDescription,
    setName,
  };
}
