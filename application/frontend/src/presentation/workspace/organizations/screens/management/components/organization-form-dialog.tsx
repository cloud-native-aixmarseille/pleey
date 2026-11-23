import type { PartySettings } from '@pleey/domain/party';
import type { ActionPermission } from '@pleey/domain/shared/primitives';
import type { ThemeId } from '@pleey/domain/theme';
import type { FormEvent } from 'react';
import type { OrganizationId } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { PartySettingsFormField } from '../../../../../shared/ui/forms/party-settings-form-field';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { ThemeSelectField } from '../../../../../theme/components/theme-select-field';
import { WorkspaceThemeSelectField } from '../../../../../theme/components/workspace-theme-select-field';
import { resolveCreateEditFormModeCopy } from './create-edit-form-mode-copy';

interface OrganizationFormDialogProps {
  readonly mode: 'create' | 'edit';
  readonly organizationId?: OrganizationId;
  readonly description: string;
  readonly errorMessage: string | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly name: string;
  readonly defaultPartySettings: PartySettings;
  readonly defaultThemeId: ThemeId | null;
  readonly onClose: () => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onNameChange: (value: string) => void;
  readonly onDefaultPartySettingsChange: (value: PartySettings) => void;
  readonly onDefaultThemeIdChange: (value: ThemeId | null) => void;
  readonly onSubmit: () => Promise<void>;
  readonly submitPermission?: ActionPermission;
  readonly submitPermissionReason?: string | null;
}

export function OrganizationFormDialog({
  mode,
  organizationId,
  description,
  errorMessage,
  isOpen,
  isSubmitting,
  name,
  defaultPartySettings,
  defaultThemeId,
  onClose,
  onDescriptionChange,
  onNameChange,
  onDefaultPartySettingsChange,
  onDefaultThemeIdChange,
  onSubmit,
  submitPermission,
  submitPermissionReason,
}: OrganizationFormDialogProps) {
  const { t } = usePresentationTranslation();
  const idPrefix = mode === 'create' ? 'create-org' : 'edit-org';
  const { titleKey, eyebrowKey, submitKey, submittingKey } = resolveCreateEditFormModeCopy(
    mode,
    'organization.management',
  );

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  return (
    <FormDialog
      banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
      eyebrow={t(eyebrowKey)}
      footer={
        <>
          <Button disabled={isSubmitting} intent="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            permission={submitPermission}
            permissionReason={submitPermissionReason}
            disabled={isSubmitting}
            intent="primary"
            type="submit"
          >
            {isSubmitting ? t(submittingKey) : t(submitKey)}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      title={t(titleKey)}
    >
      <FieldShell id={`${idPrefix}-name`} label={t('organization.management.create.fields.name.label')} required>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          placeholder={t('organization.management.create.fields.name.placeholder')}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>

      <FieldShell id={`${idPrefix}-description`} label={t('organization.management.create.fields.description.label')}>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          placeholder={t('organization.management.create.fields.description.placeholder')}
          rows={3}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>

      {mode === 'edit' && organizationId ? (
        <WorkspaceThemeSelectField
          organizationId={organizationId}
          id={`${idPrefix}-theme`}
          value={defaultThemeId}
          disabled={isSubmitting}
          onChange={onDefaultThemeIdChange}
        />
      ) : (
        <ThemeSelectField
          id={`${idPrefix}-theme`}
          value={defaultThemeId}
          disabled={isSubmitting}
          onChange={onDefaultThemeIdChange}
        />
      )}

      <PartySettingsFormField
        id={`${idPrefix}-party-settings`}
        settings={defaultPartySettings}
        disabled={isSubmitting}
        onChange={onDefaultPartySettingsChange}
      />
    </FormDialog>
  );
}
