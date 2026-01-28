import { type FormEvent, useState } from 'react';
import type { CreateOrganizationCommand } from '../../../../../../application/workspace/organizations/contracts/create-organization-command';
import { OrganizationFormFacade } from '../../../../../../application/workspace/organizations/facades/organization-form.facade';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { useRuntimeDependency } from '../../../../../shared/di/use-runtime-dependency';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';

interface CreateOrganizationFormProps {
  readonly onSubmit: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly onCreated: (organization: Organization) => void;
}

export function CreateOrganizationForm({ onSubmit, onCreated }: CreateOrganizationFormProps) {
  const { t } = usePresentationTranslation();
  const organizationFormFacade = useRuntimeDependency(OrganizationFormFacade);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <>
      <Button intent="success" onClick={handleOpen} width="wide">
        {t('organization.management.createOpenButton')}
      </Button>

      <FormDialog
        banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
        eyebrow={t('organization.management.createEyebrow')}
        footer={
          <>
            <Button disabled={isSubmitting} intent="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button disabled={isSubmitting} intent="success" type="submit">
              {isSubmitting
                ? t('organization.management.createSubmitting')
                : t('organization.management.createSubmit')}
            </Button>
          </>
        }
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={t('organization.management.createTitle')}
      >
        <FieldShell
          id="create-org-name"
          label={t('organization.management.createNameLabel')}
          required
        >
          <Input
            id="create-org-name"
            name="name"
            placeholder={t('organization.management.createNamePlaceholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>

        <FieldShell
          id="create-org-description"
          label={t('organization.management.createDescriptionLabel')}
        >
          <Textarea
            id="create-org-description"
            name="description"
            placeholder={t('organization.management.createDescriptionPlaceholder')}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </FieldShell>
      </FormDialog>
    </>
  );
}
