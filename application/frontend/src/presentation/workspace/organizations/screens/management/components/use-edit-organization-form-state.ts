import { useState } from 'react';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { UpdateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface UseEditOrganizationFormStateParams {
  readonly onSubmit: (command: UpdateOrganizationCommand) => Promise<Organization>;
  readonly onUpdated: (organization: Organization) => void;
  readonly organization: Organization;
}

export function useEditOrganizationFormState({
  onSubmit,
  onUpdated,
  organization,
}: UseEditOrganizationFormStateParams) {
  const { t } = usePresentationTranslation();
  const { organizationFormFacade } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [partySettings, setPartySettings] = useState<PartySettings>(DEFAULT_PARTY_SETTINGS);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    feedback.clearError();
  }

  function handleOpen() {
    setName(organization.name);
    setDescription(organization.description ?? '');
    setPartySettings(organization.defaultPartySettings ?? DEFAULT_PARTY_SETTINGS);
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
      const command = organizationFormFacade.createCommand(name, description, partySettings);
      const updatedOrganization = await onSubmit({
        organizationId: organization.id,
        ...command,
      });

      setIsOpen(false);
      onUpdated(updatedOrganization);
      feedback.notify('success', t('organization.management.edit.success'), {
        id: 'organization-update-success-toast',
      });
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: 'organization.errors.updateFailed',
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
