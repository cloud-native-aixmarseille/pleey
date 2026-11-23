import type { PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';
import { useState } from 'react';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { usePresentationFeedbackChannel } from '../../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';
import type { OrganizationFormValues } from './organization-form-values';

interface UseOrganizationFormDialogStateParams {
  readonly getInitialValues: () => OrganizationFormValues;
  readonly onSubmit: (values: OrganizationFormValues) => Promise<Organization>;
  readonly onSubmitted: (organization: Organization) => void;
  readonly successMessageKey: string;
  readonly successNotificationId: string;
  readonly fallbackErrorKey: string;
}

export function useOrganizationFormDialogState({
  getInitialValues,
  onSubmit,
  onSubmitted,
  successMessageKey,
  successNotificationId,
  fallbackErrorKey,
}: UseOrganizationFormDialogStateParams) {
  const { t } = usePresentationTranslation();
  const { organizationFormFacade } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const initialValues = getInitialValues();
  const [name, setName] = useState(initialValues.name);
  const [defaultThemeId, setDefaultThemeId] = useState<ThemeId | null>(initialValues.defaultThemeId);
  const [description, setDescription] = useState(initialValues.description);
  const [defaultPartySettings, setDefaultPartySettings] = useState<PartySettings>(initialValues.defaultPartySettings);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function applyInitialValues() {
    const values = getInitialValues();
    setName(values.name);
    setDefaultThemeId(values.defaultThemeId);
    setDescription(values.description);
    setDefaultPartySettings(values.defaultPartySettings);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    feedback.clearError();
    applyInitialValues();
  }

  function handleOpen() {
    applyInitialValues();
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
      const organization = await onSubmit({
        name,
        defaultThemeId,
        description,
        defaultPartySettings,
      });

      setIsOpen(false);
      onSubmitted(organization);
      feedback.notify('success', t(successMessageKey), {
        id: successNotificationId,
      });
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: fallbackErrorKey,
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
    defaultPartySettings,
    setDescription,
    setName,
    setDefaultPartySettings,
    defaultThemeId,
    setDefaultThemeId,
  };
}
