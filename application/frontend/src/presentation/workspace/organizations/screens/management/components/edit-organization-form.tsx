import type { FormEvent } from 'react';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import type { UpdateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { PartySettingsCheckboxes } from '../../../../../shared/ui/forms/party-settings-checkboxes';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { useEditOrganizationFormState } from './use-edit-organization-form-state';

interface EditOrganizationFormProps {
  readonly onSubmit: (command: UpdateOrganizationCommand) => Promise<Organization>;
  readonly onUpdated: (organization: Organization) => void;
  readonly organization: Organization | null;
}

export function EditOrganizationForm({ onSubmit, onUpdated, organization }: EditOrganizationFormProps) {
  if (
    !organization ||
    (organization.role !== OrganizationRole.OWNER && organization.role !== OrganizationRole.MANAGER)
  ) {
    return null;
  }

  return <EditableOrganizationFormContent organization={organization} onSubmit={onSubmit} onUpdated={onUpdated} />;
}

interface EditableOrganizationFormContentProps {
  readonly onSubmit: (command: UpdateOrganizationCommand) => Promise<Organization>;
  readonly onUpdated: (organization: Organization) => void;
  readonly organization: Organization;
}

function EditableOrganizationFormContent({ onSubmit, onUpdated, organization }: EditableOrganizationFormContentProps) {
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
    partySettings,
    setDescription,
    setName,
    setPartySettings,
  } = useEditOrganizationFormState({
    onSubmit,
    onUpdated,
    organization,
  });

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit();
  }

  return (
    <>
      <Button intent="ghost" onClick={handleOpen} size="sm" type="button">
        {t('organization.management.edit.openButton')}
      </Button>

      <FormDialog
        banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
        eyebrow={t('organization.management.edit.eyebrow')}
        footer={
          <>
            <Button disabled={isSubmitting} intent="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button disabled={isSubmitting} intent="primary" type="submit">
              {isSubmitting ? t('organization.management.edit.submitting') : t('organization.management.edit.submit')}
            </Button>
          </>
        }
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleFormSubmit}
        title={t('organization.management.edit.title')}
      >
        <FieldShell id="edit-org-name" label={t('organization.management.create.fields.name.label')} required>
          <Input
            id="edit-org-name"
            name="name"
            placeholder={t('organization.management.create.fields.name.placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>

        <FieldShell id="edit-org-description" label={t('organization.management.create.fields.description.label')}>
          <Textarea
            id="edit-org-description"
            name="description"
            placeholder={t('organization.management.create.fields.description.placeholder')}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>

        <FieldShell id="edit-org-party-settings" label={t('organization.management.create.fields.partySettings.label')}>
          <PartySettingsCheckboxes
            idPrefix="edit-org"
            settings={partySettings}
            translationKeyPrefix="organization.management.create.fields.partySettings"
            disabled={isSubmitting}
            onChange={setPartySettings}
          />
        </FieldShell>
      </FormDialog>
    </>
  );
}
