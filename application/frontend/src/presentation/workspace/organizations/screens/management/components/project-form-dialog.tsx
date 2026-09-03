import type { FormEvent } from 'react';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { PartySettingsCheckboxes } from '../../../../../shared/ui/forms/party-settings-checkboxes';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { useProjectFormDialogState } from './use-project-form-dialog-state';

interface ProjectFormDialogProps {
  readonly defaultPartySettings?: PartySettings;
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly organizationName: string | null;
  readonly project: Project | null;
  readonly onClose: () => void;
  readonly onSubmit: (values: {
    name: string;
    description: string | null;
    partySettings: PartySettings;
  }) => Promise<Project>;
  readonly onSubmitted: (project: Project) => void;
}

export function ProjectFormDialog({
  defaultPartySettings = DEFAULT_PARTY_SETTINGS,
  isOpen,
  mode,
  organizationName,
  project,
  onClose,
  onSubmit,
  onSubmitted,
}: ProjectFormDialogProps) {
  const { t } = usePresentationTranslation();
  const {
    description,
    errorMessage,
    handleSubmit,
    isSubmitting,
    name,
    partySettings,
    setDescription,
    setName,
    setPartySettings,
  } = useProjectFormDialogState({
    defaultPartySettings,
    isOpen,
    mode,
    onSubmit,
    onSubmitted,
    project,
  });

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit();
  }

  const titleKey = mode === 'create' ? 'project.management.form.create.title' : 'project.management.form.edit.title';
  const eyebrowKey =
    mode === 'create' ? 'project.management.form.create.eyebrow' : 'project.management.form.edit.eyebrow';
  const submitKey = mode === 'create' ? 'project.management.form.create.submit' : 'project.management.form.edit.submit';
  const submittingKey =
    mode === 'create' ? 'project.management.form.create.submitting' : 'project.management.form.edit.submitting';

  return (
    <FormDialog
      banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
      eyebrow={t(eyebrowKey)}
      footer={
        <>
          <Button disabled={isSubmitting} intent="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={isSubmitting} intent="primary" type="submit">
            {isSubmitting ? t(submittingKey) : t(submitKey)}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      title={t(titleKey, {
        organization: organizationName ?? t('project.management.form.fallbackOrganization'),
      })}
    >
      <FieldShell id="project-name" label={t('project.management.form.fields.name.label')} required>
        <Input
          id="project-name"
          name="name"
          placeholder={t('project.management.form.fields.name.placeholder')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>

      <FieldShell id="project-description" label={t('project.management.form.fields.description.label')}>
        <Textarea
          id="project-description"
          name="description"
          placeholder={t('project.management.form.fields.description.placeholder')}
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>

      <FieldShell id="project-party-settings" label={t('project.management.form.fields.partySettings.label')}>
        <PartySettingsCheckboxes
          idPrefix="project-party-settings"
          settings={partySettings}
          translationKeyPrefix="project.management.form.fields.partySettings"
          disabled={isSubmitting}
          onChange={setPartySettings}
        />
      </FieldShell>
    </FormDialog>
  );
}
