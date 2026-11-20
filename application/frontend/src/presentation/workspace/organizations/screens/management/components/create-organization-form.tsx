import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { CreateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { OrganizationFormDialog } from './organization-form-dialog';
import { createOrganizationInitialValues, toCreateOrganizationCommand } from './organization-form-values';
import { useOrganizationFormDialogState } from './use-organization-form-dialog-state';

interface CreateOrganizationFormProps {
  readonly onSubmit: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly onCreated: (organization: Organization) => void;
}

export function CreateOrganizationForm({ onSubmit, onCreated }: CreateOrganizationFormProps) {
  const { t } = usePresentationTranslation();
  const {
    description,
    errorMessage,
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
  } = useOrganizationFormDialogState({
    getInitialValues: createOrganizationInitialValues,
    onSubmit: async (values) => onSubmit(toCreateOrganizationCommand(values)),
    onSubmitted: onCreated,
    successMessageKey: 'organization.management.create.success',
    successNotificationId: 'organization-create-success-toast',
    fallbackErrorKey: 'organization.errors.createFailed',
  });

  return (
    <>
      <Button intent="primary" onClick={handleOpen} width="wide">
        {t('organization.management.create.openButton')}
      </Button>

      <OrganizationFormDialog
        mode="create"
        description={description}
        errorMessage={errorMessage}
        isOpen={isOpen}
        isSubmitting={isSubmitting}
        name={name}
        defaultPartySettings={defaultPartySettings}
        defaultThemeId={defaultThemeId}
        onClose={handleClose}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onDefaultPartySettingsChange={setDefaultPartySettings}
        onDefaultThemeIdChange={setDefaultThemeId}
        onSubmit={handleSubmit}
      />
    </>
  );
}
