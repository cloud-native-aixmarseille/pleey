import { useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { isDomainError } from '../../../domains/shared/errors/domain-error';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
import { usePresentationForm } from '../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { FormDialog } from '../../shared/ui/overlay/form-dialog';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { ThemeDocumentEditor } from './theme-document-editor';
export function ThemeBuilderDialog({
  organizationId,
  theme,
  onClose,
  onSaved,
}: {
  readonly organizationId: OrganizationId;
  readonly theme: ManagedTheme | null;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const { t } = usePresentationTranslation();
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const initial: ThemeDocument = theme?.document ?? {
    schemaVersion: 1,
    baseThemeId: 'cyber-arcade',
    name: t('theme.builder.newName'),
    overrides: {},
  };
  const form = usePresentationForm({
    defaultValues: { document: initial },
    validators: {
      onChange: ({ value }) => {
        try {
          themeManagementFacade.normalize(value.document);
          return undefined;
        } catch {
          return { fields: { document: t('theme.errors.invalidDocument') } };
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (busy || uploading) return;
      setBusy(true);
      setError(null);
      try {
        await themeManagementFacade.save({
          organizationId,
          document: value.document,
          themeId: theme?.id,
          expectedRevision: theme?.revision,
        });
        onSaved();
      } catch (failure) {
        setError(
          isDomainError(failure) && failure.code === ThemeErrorCode.REVISION_CONFLICT
            ? 'theme.errors.revisionConflict'
            : 'theme.builder.saveFailed',
        );
      } finally {
        setBusy(false);
      }
    },
  });
  return (
    <form.AppForm>
      <FormDialog
        isOpen
        title={t('theme.builder.title')}
        onClose={() => {
          if (!busy && !uploading) onClose();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        banner={<StatusBanner tone="error">{error ? t(error) : null}</StatusBanner>}
        footer={
          <>
            <Button disabled={busy || uploading} intent="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button disabled={busy || uploading} type="submit">
              {t('theme.builder.save')}
            </Button>
          </>
        }
      >
        <form.AppField name="document">
          {() => (
            <ThemeDocumentEditor
              organizationId={organizationId}
              disabled={busy || uploading}
              onUploadingChange={setUploading}
            />
          )}
        </form.AppField>
      </FormDialog>
    </form.AppForm>
  );
}
