import type { FormEvent } from 'react';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { CreateOrganizationCommand } from '../../../../../../domains/organization/ports/organization-repository';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { Checkbox } from '../../../../../shared/ui/forms/checkbox';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { useCreateOrganizationFormState } from './use-create-organization-form-state';

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
    partySettings,
    setDescription,
    setName,
    setPartySettings,
  } = useCreateOrganizationFormState({
    onSubmit: onSubmit as (command: CreateOrganizationCommand) => Promise<Organization>,
    onCreated,
  });

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit();
  }

  return (
    <>
      <Button intent="primary" onClick={handleOpen} width="wide">
        {t('organization.management.create.openButton')}
      </Button>

      <FormDialog
        banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
        eyebrow={t('organization.management.create.eyebrow')}
        footer={
          <>
            <Button disabled={isSubmitting} intent="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button disabled={isSubmitting} intent="primary" type="submit">
              {isSubmitting
                ? t('organization.management.create.submitting')
                : t('organization.management.create.submit')}
            </Button>
          </>
        }
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleFormSubmit}
        title={t('organization.management.create.title')}
      >
        <FieldShell id="create-org-name" label={t('organization.management.create.fields.name.label')} required>
          <Input
            id="create-org-name"
            name="name"
            placeholder={t('organization.management.create.fields.name.placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>

        <FieldShell id="create-org-description" label={t('organization.management.create.fields.description.label')}>
          <Textarea
            id="create-org-description"
            name="description"
            placeholder={t('organization.management.create.fields.description.placeholder')}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>

        <FieldShell
          id="create-org-party-settings"
          label={t('organization.management.create.fields.partySettings.label')}
        >
          <Checkbox
            id="create-org-allow-joining-after-start"
            label={t('organization.management.create.fields.partySettings.allowJoiningAfterStartLabel')}
            description={t(
              'organization.management.create.fields.partySettings.allowJoiningAfterStartDescription',
            )}
            checked={partySettings.allowJoiningAfterStart}
            onChange={(event) =>
              setPartySettings({
                ...partySettings,
                allowJoiningAfterStart: event.currentTarget.checked,
              })
            }
            disabled={isSubmitting}
          />
          <Checkbox
            id="create-org-allow-option-change-after-voting"
            label={t('organization.management.create.fields.partySettings.allowOptionChangeAfterVotingLabel')}
            description={t(
              'organization.management.create.fields.partySettings.allowOptionChangeAfterVotingDescription',
            )}
            checked={partySettings.allowOptionChangeAfterVoting}
            onChange={(event) =>
              setPartySettings({
                ...partySettings,
                allowOptionChangeAfterVoting: event.currentTarget.checked,
              })
            }
            disabled={isSubmitting}
          />
          <Checkbox
            id="create-org-randomize-stage-order"
            label={t('organization.management.create.fields.partySettings.randomizeStageOrderLabel')}
            description={t('organization.management.create.fields.partySettings.randomizeStageOrderDescription')}
            checked={partySettings.randomizeStageOrder}
            onChange={(event) =>
              setPartySettings({
                ...partySettings,
                randomizeStageOrder: event.currentTarget.checked,
              })
            }
            disabled={isSubmitting}
          />
          <Checkbox
            id="create-org-randomize-option-order"
            label={t('organization.management.create.fields.partySettings.randomizeOptionOrderLabel')}
            description={t('organization.management.create.fields.partySettings.randomizeOptionOrderDescription')}
            checked={partySettings.randomizeOptionOrder}
            onChange={(event) =>
              setPartySettings({
                ...partySettings,
                randomizeOptionOrder: event.currentTarget.checked,
              })
            }
            disabled={isSubmitting}
          />
        </FieldShell>
      </FormDialog>
    </>
  );
}
