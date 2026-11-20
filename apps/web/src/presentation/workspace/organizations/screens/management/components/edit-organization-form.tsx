import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { UpdateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { useWorkspacePermissionReason } from '../../../../shared/hooks/use-workspace-permission-reason';
import { OrganizationFormDialog } from './organization-form-dialog';
import { editOrganizationInitialValues, toUpdateOrganizationCommand } from './organization-form-values';
import { useOrganizationFormDialogState } from './use-organization-form-dialog-state';

interface EditOrganizationFormProps {
  readonly onSubmit: (command: UpdateOrganizationCommand) => Promise<Organization>;
  readonly onUpdated: (organization: Organization) => void;
  readonly organization: Organization | null;
}

export function EditOrganizationForm({ onSubmit, onUpdated, organization }: EditOrganizationFormProps) {
  if (!organization) return null;

  return <EditableOrganizationFormContent organization={organization} onSubmit={onSubmit} onUpdated={onUpdated} />;
}

interface EditableOrganizationFormContentProps {
  readonly onSubmit: (command: UpdateOrganizationCommand) => Promise<Organization>;
  readonly onUpdated: (organization: Organization) => void;
  readonly organization: Organization;
}

function EditableOrganizationFormContent({ onSubmit, onUpdated, organization }: EditableOrganizationFormContentProps) {
  const reason = useWorkspacePermissionReason();
  const { t } = usePresentationTranslation();
  const updatePermissionReason = reason(organization.permissions.update);

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
    getInitialValues: () => editOrganizationInitialValues(organization),
    onSubmit: async (values) => onSubmit(toUpdateOrganizationCommand(organization.id, values)),
    onSubmitted: onUpdated,
    successMessageKey: 'organization.management.edit.success',
    successNotificationId: 'organization-update-success-toast',
    fallbackErrorKey: 'organization.errors.updateFailed',
  });

  return (
    <>
      <Button
        permission={organization.permissions.update}
        permissionReason={updatePermissionReason}
        intent="ghost"
        onClick={handleOpen}
        size="sm"
        type="button"
      >
        {t('organization.management.edit.openButton')}
      </Button>

      <OrganizationFormDialog
        mode="edit"
        organizationId={organization.id}
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
        submitPermission={organization.permissions.update}
        submitPermissionReason={updatePermissionReason}
      />
    </>
  );
}
