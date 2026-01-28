import { type FormEvent, useEffect, useState } from 'react';
import { ProjectFormFacade } from '../../../../../../application/workspace/projects/facades/project-form.facade';
import type { Project } from '../../../../../../domains/project/entities/project';
import { useRuntimeDependency } from '../../../../../shared/di/use-runtime-dependency';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';

interface ProjectFormDialogProps {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly organizationName: string | null;
  readonly project: Project | null;
  readonly onClose: () => void;
  readonly onSubmit: (values: { name: string; description: string | null }) => Promise<Project>;
  readonly onSubmitted: (project: Project) => void;
}

export function ProjectFormDialog({
  isOpen,
  mode,
  organizationName,
  project,
  onClose,
  onSubmit,
  onSubmitted,
}: ProjectFormDialogProps) {
  const { t } = usePresentationTranslation();
  const projectFormFacade = useRuntimeDependency(ProjectFormFacade);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setErrorMessage(null);
  }, [isOpen, project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const validationError = projectFormFacade.validateName(name);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const savedProject = await onSubmit(projectFormFacade.createInput(name, description));

      onSubmitted(savedProject);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : mode === 'create'
            ? 'project.errors.createFailed'
            : 'project.errors.updateFailed',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const titleKey =
    mode === 'create'
      ? 'organization.management.projectsCreateTitle'
      : 'organization.management.projectsEditTitle';
  const eyebrowKey =
    mode === 'create'
      ? 'organization.management.projectsCreateEyebrow'
      : 'organization.management.projectsEditEyebrow';
  const submitKey =
    mode === 'create'
      ? 'organization.management.projectsCreateSubmit'
      : 'organization.management.projectsEditSubmit';
  const submittingKey =
    mode === 'create'
      ? 'organization.management.projectsCreateSubmitting'
      : 'organization.management.projectsEditSubmitting';

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
      onSubmit={handleSubmit}
      title={t(titleKey, {
        organization: organizationName ?? t('organization.management.projectsFallbackOrg'),
      })}
    >
      <FieldShell id="project-name" label={t('organization.management.projectsNameLabel')} required>
        <Input
          id="project-name"
          name="name"
          placeholder={t('organization.management.projectsNamePlaceholder')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>

      <FieldShell
        id="project-description"
        label={t('organization.management.projectsDescriptionLabel')}
      >
        <Textarea
          id="project-description"
          name="description"
          placeholder={t('organization.management.projectsDescriptionPlaceholder')}
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
        />
      </FieldShell>
    </FormDialog>
  );
}
