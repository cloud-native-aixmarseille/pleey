import { useState } from 'react';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { CreateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseCreateOrganizationFormStateParams {
  readonly onSubmit: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly onCreated: (organization: Organization) => void;
}

export function useCreateOrganizationFormState({ onSubmit, onCreated }: UseCreateOrganizationFormStateParams) {
  const { t } = usePresentationTranslation();
  const { organizationFormFacade } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [partySettings, setPartySettings] = useState<PartySettings>(DEFAULT_PARTY_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setDescription('');
    setPartySettings(DEFAULT_PARTY_SETTINGS);
    feedback.clearError();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    resetForm();
  }

  function handleOpen() {
    feedback.clearError();
    setIsOpen(true);
  }

  async function handleSubmit() {
    feedback.clearError();

    const validationError = organizationFormFacade.validateName(name);
    if (validationError) {
      feedback.setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const organization = await onSubmit(
        organizationFormFacade.createCommand(name, description, partySettings) as CreateOrganizationCommand,
      );

      resetForm();
      setIsOpen(false);
      onCreated(organization);
      feedback.notify('success', t('organization.management.create.success'), {
        id: 'organization-create-success-toast',
      });
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: 'organization.errors.createFailed',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    description,
    errorMessage: feedback.errorMessage,
    handleClose,
    handleOpen,
    handleSubmit,
    isOpen,
    isSubmitting,
    name,
    partySettings,
    setDescription,
    setName,
    setPartySettings,
  };
}
