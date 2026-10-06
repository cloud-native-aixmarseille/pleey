import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { isDomainError } from '../../../domains/shared/errors/domain-error';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import type { CuratedThemeId } from '../../../domains/theme/entities/theme-id';
import { ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
import { useAuth } from '../../identity/contexts/auth-context';
import { usePresentationForm } from '../../shared/forms/use-presentation-form';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { ThemeDocumentEditor } from './theme-document-editor';
import { useThemeActionPermission } from './theme-permissions-context';
import { ThemeStudioShell } from './theme-studio-shell';

export function ThemeBuilderForm({
  organizationId,
  theme,
  starter = 'cyber-arcade',
  onCancel,
  onSaved,
}: {
  readonly organizationId: OrganizationId;
  readonly theme: ManagedTheme | null;
  readonly starter?: CuratedThemeId;
  readonly onCancel: () => void;
  readonly onSaved: (theme: ManagedTheme) => void;
}) {
  const { t } = usePresentationTranslation();
  const { user } = useAuth();
  const { themeManagementFacade: facade } = useWorkspaceDependencies();
  const [savedTheme, setSavedTheme] = useState(theme);
  const createPermission = useThemeActionPermission('create');
  const updatePermission = useThemeActionPermission('update');
  const [failure, setFailure] = useState<'failed' | 'conflict' | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [saveResult, setSaveResult] = useState<ManagedTheme | null>(null);
  const saveAsNew = useRef(false);
  const [initial] = useState<ThemeDocument>(
    () =>
      theme?.document ?? {
        schemaVersion: 1,
        baseThemeId: starter,
        name: t('theme.builder.newName'),
        overrides: {},
      },
  );
  const clearDraft = () => {
    if (user) facade.removeDraft({ userId: user.id, organizationId, themeId: savedTheme?.id ?? 'new' });
  };
  const form = usePresentationForm({
    defaultValues: { document: savedTheme?.document ?? initial },
    validators: {
      onChange: ({ value }) => {
        try {
          facade.normalize(value.document);
          return undefined;
        } catch {
          return { fields: { document: t('theme.errors.invalidDocument') } };
        }
      },
    },
    onSubmit: async ({ value }) => {
      const permission = saveAsNew.current || !savedTheme ? createPermission : updatePermission;
      if (!permission.allowed) return;
      if (busy || uploading || (failure === 'conflict' && !saveAsNew.current)) return;
      setBusy(true);
      setFailure(null);
      try {
        const result = await facade.save({
          organizationId,
          document: value.document,
          themeId: saveAsNew.current ? undefined : savedTheme?.id,
          expectedRevision: saveAsNew.current ? undefined : savedTheme?.revision,
        });
        clearDraft();
        form.reset({ document: result.document });
        setSavedTheme(result);
        setSaveResult(result);
      } catch (error) {
        permission.refresh?.();
        setFailure(
          failure === 'conflict' || (isDomainError(error) && error.code === ThemeErrorCode.REVISION_CONFLICT)
            ? 'conflict'
            : 'failed',
        );
      } finally {
        setBusy(false);
        saveAsNew.current = false;
      }
    },
  });
  const notifySaved = useEffectEvent(onSaved);
  useEffect(() => {
    if (saveResult) notifySaved(saveResult);
  }, [saveResult]);
  const reload = async () => {
    if (!savedTheme || busy) return;
    setBusy(true);
    try {
      const current = await facade.get(organizationId, savedTheme.id);
      clearDraft();
      form.reset({ document: current.document });
      setSavedTheme(current);
      setEditorEpoch((epoch) => epoch + 1);
      setFailure(null);
    } catch {
      updatePermission.refresh?.();
      setFailure((current) => (current === 'conflict' ? 'conflict' : 'failed'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <ThemeStudioShell>
      <form.AppForm>
        <form
          aria-label={t('theme.builder.title')}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="document">
            {() => (
              <ThemeDocumentEditor
                key={editorEpoch}
                organizationId={organizationId}
                initial={initial}
                savedTheme={savedTheme}
                busy={busy}
                uploading={uploading}
                failure={failure}
                onBack={onCancel}
                onUploadingChange={setUploading}
                onSaveAsNew={() => {
                  saveAsNew.current = true;
                  void form.handleSubmit();
                }}
                onReload={() => void reload()}
                onConflict={() => setFailure('conflict')}
              />
            )}
          </form.AppField>
        </form>
      </form.AppForm>
    </ThemeStudioShell>
  );
}
