import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { isDomainError } from '../../../domains/shared/errors/domain-error';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { usePresentationFormPort } from '../../shared/forms/form-provider';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { usePresentationNavigationBlocker } from '../../shared/routing/router';
import { Button } from '../../shared/ui/actions/button';
import { UnderlineTabButton } from '../../shared/ui/actions/underline-tab-button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { ActionRow, ContentStack, ResponsiveGrid, SidebarLayout } from '../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../shared/ui/layout/use-presentation-media-query';
import { ConfirmDialog } from '../../shared/ui/overlay/confirm-dialog';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { useThemeDraft } from '../hooks/use-theme-draft';
import { useThemeHistory } from '../hooks/use-theme-history';
import { ThemeAssetFields } from './theme-asset-fields';
import { ThemeBrandControls } from './theme-brand-controls';
import { useThemeActionPermission } from './theme-permissions-context';
import { ThemeStudioPreview } from './theme-studio-preview';
import { ThemeStudioToolbar } from './theme-studio-toolbar';
import { ThemeStyleControls } from './theme-style-controls';
import { ThemeValidationContext } from './theme-validation-context';

export function ThemeDocumentEditor({
  organizationId,
  savedTheme,
  initial,
  busy,
  uploading,
  failure,
  onBack,
  onUploadingChange,
  onSaveAsNew,
  onReload,
  onConflict,
}: {
  readonly organizationId: OrganizationId;
  readonly savedTheme: ManagedTheme | null;
  readonly initial: ThemeDocument;
  readonly busy: boolean;
  readonly uploading: boolean;
  readonly failure: 'failed' | 'conflict' | null;
  readonly onBack: () => void;
  readonly onUploadingChange: (uploading: boolean) => void;
  readonly onSaveAsNew: () => void;
  readonly onReload: () => void;
  readonly onConflict: () => void;
}) {
  const { t } = usePresentationTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const field = usePresentationFormPort().useFieldContext<ThemeDocument>();
  const { themeManagementFacade: facade } = useWorkspaceDependencies();
  const document = field.state.value;
  const dirty = JSON.stringify(document) !== JSON.stringify(savedTheme?.document ?? initial);
  const history = useThemeHistory(document, field.handleChange);
  const [section, setSection] = useState<'brand' | 'style' | 'assets'>('brand');
  const [mobileView, setMobileView] = useState('edit');
  const mobile = usePresentationMediaQuery('(max-width: 61.99em)');
  const [reloadRequested, setReloadRequested] = useState(false);
  const [lastValid, setLastValid] = useState(savedTheme?.document ?? initial);
  const draft = useThemeDraft({
    organizationId,
    themeId: savedTheme?.id ?? 'new',
    revision: savedTheme?.revision ?? null,
    document,
    dirty,
    blocked: busy || uploading,
  });
  const blocker = usePresentationNavigationBlocker(dirty || busy || uploading);
  let valid: ThemeDocument | null = null;
  let invalidField = '';
  try {
    valid = facade.normalize(document);
  } catch (error) {
    invalidField = isDomainError(error) && typeof error.context?.field === 'string' ? error.context.field : '';
  }
  const updatePreview = useEffectEvent(() => {
    if (valid) setLastValid(valid);
  });
  useEffect(() => {
    updatePreview();
  }, [document]);
  useEffect(() => {
    if (!dirty && !busy && !uploading) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, busy, uploading]);
  const undoShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (busy || uploading || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
    if (
      !(event.target instanceof Element) ||
      !event.target.closest('[data-theme-editor]') ||
      event.target.closest('input,textarea,select,[contenteditable=true]')
    )
      return;
    event.preventDefault();
    if (event.shiftKey) history.redo();
    else history.undo();
  });
  useEffect(() => {
    window.addEventListener('keydown', undoShortcut);
    return () => window.removeEventListener('keydown', undoShortcut);
  }, []);
  const savePermission = useThemeActionPermission(savedTheme ? 'update' : 'create');
  const createPermission = useThemeActionPermission('create');
  const disabled = busy || uploading;
  const status = busy
    ? 'theme.studio.saving'
    : uploading
      ? 'theme.studio.uploading'
      : failure
        ? 'theme.studio.saveFailed'
        : dirty || !savedTheme
          ? 'theme.studio.unsaved'
          : 'theme.studio.saved';
  const problem = invalidField.includes('contrast') ? 'theme.studio.contrastIssue' : 'theme.errors.invalidDocument';
  const fieldPath = invalidField
    .replace(/\.contrast$/, '')
    .replace(/^(light|dark)\.(?!colorScales)/, 'semantic.$1.')
    .replace(/^(light|dark)\.colorScales/, 'colorScales');
  const reviewField = () => {
    setSection(
      /^(radius|motion|spacing|typography)/.test(fieldPath)
        ? 'style'
        : fieldPath.startsWith('assets')
          ? 'assets'
          : 'brand',
    );
    setMobileView('edit');
    window.requestAnimationFrame(() => {
      const inputs = editorRef.current?.querySelectorAll<HTMLElement>('[data-theme-field]');
      const target = Array.from(inputs ?? []).find((input) => {
        const path = input.dataset.themeField;
        return path && (path === fieldPath || fieldPath.startsWith(`${path}.`) || path.startsWith(`${fieldPath}.`));
      });
      let ancestor = target?.parentElement;
      while (ancestor) {
        if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
      target?.focus();
      target?.scrollIntoView?.({ block: 'nearest' });
    });
  };
  return (
    <ThemeValidationContext value={{ field: fieldPath, descriptionId }}>
      <div data-theme-editor ref={editorRef}>
        <ContentStack gap="lg">
          <ThemeStudioToolbar
            name={document.name}
            onNameChange={(name) => history.change({ ...document, name }, 'name')}
            onBack={onBack}
            onUndo={history.undo}
            onRedo={history.redo}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            disabled={disabled || !!draft.recoverable}
            saveDisabled={
              disabled || !valid || !!draft.recoverable || failure === 'conflict' || !savePermission.allowed
            }
            savePermission={savePermission.permission}
            savePermissionReason={savePermission.reason}
            status={status}
          />
          {savedTheme && !dirty && <SupportingText>{t('theme.studio.savedHelp')}</SupportingText>}
          {(failure || !valid || draft.recoverable || draft.unavailable || uploading) && (
            <ContentStack>
              <StatusBanner tone="error">
                {failure
                  ? t(failure === 'conflict' ? 'theme.errors.revisionConflict' : 'theme.builder.saveFailed')
                  : null}
              </StatusBanner>
              {failure === 'conflict' && (
                <ActionRow>
                  <Button
                    onClick={onSaveAsNew}
                    disabled={disabled || !valid || !createPermission.allowed}
                    permission={createPermission.permission}
                    permissionReason={createPermission.reason}
                  >
                    {t('theme.studio.saveAsNew')}
                  </Button>
                  <Button intent="ghost" onClick={() => setReloadRequested(true)} disabled={disabled}>
                    {t('theme.studio.reloadSaved')}
                  </Button>
                </ActionRow>
              )}
              <div id={descriptionId}>
                <StatusBanner tone="error">{!valid ? t(problem) : null}</StatusBanner>
              </div>
              {invalidField && (
                <Button intent="ghost" onClick={reviewField}>
                  {t('theme.studio.reviewValues')}
                </Button>
              )}
              {uploading && <StatusBanner>{t('theme.studio.uploadingHelp')}</StatusBanner>}
              {draft.recoverable && (
                <>
                  <StatusBanner>
                    {t(
                      draft.recoverable.sourceRevision === (savedTheme?.revision ?? null)
                        ? 'theme.studio.recoverDraft'
                        : 'theme.studio.outdatedDraft',
                    )}
                  </StatusBanner>
                  <ActionRow>
                    <Button
                      disabled={disabled}
                      onClick={() => {
                        const recovery = draft.recoverable;
                        if (!recovery) return;
                        history.change(recovery.document);
                        if (recovery.sourceRevision !== (savedTheme?.revision ?? null)) onConflict();
                        draft.accept();
                      }}
                    >
                      {t('theme.studio.restoreDraft')}
                    </Button>
                    <Button intent="ghost" onClick={draft.discard}>
                      {t('theme.studio.discardDraft')}
                    </Button>
                  </ActionRow>
                </>
              )}
              {draft.unavailable && <StatusBanner tone="warning">{t('theme.studio.storageUnavailable')}</StatusBanner>}
            </ContentStack>
          )}
          <div hidden={!mobile}>
            <div role="group" aria-label={t('theme.studio.mobileView')}>
              <ResponsiveGrid columns={{ base: 2 }} gap="sm">
                {(['edit', 'preview'] as const).map((view) => (
                  <UnderlineTabButton
                    key={view}
                    active={mobileView === view}
                    aria-pressed={mobileView === view}
                    onClick={() => setMobileView(view)}
                  >
                    {t(`theme.studio.views.${view}`)}
                  </UnderlineTabButton>
                ))}
              </ResponsiveGrid>
            </div>
          </div>
          <SidebarLayout
            sidebarWidth="wide"
            sidebar={
              <div hidden={mobile && mobileView !== 'edit'}>
                <aside className="theme-studio-inspector" aria-label={t('theme.studio.controls')}>
                  <ElevatedPanel>
                    <ContentStack gap="lg">
                      <ContentStack gap="sm">
                        <Heading level={3}>{t('theme.studio.makeYours')}</Heading>
                        <SupportingText>{t('theme.studio.intro')}</SupportingText>
                      </ContentStack>
                      <nav aria-label={t('theme.studio.sections')}>
                        <ActionRow gap="xs">
                          {(['brand', 'style', 'assets'] as const).map((value) => (
                            <Button
                              key={value}
                              size="sm"
                              intent={section === value ? 'secondary' : 'ghost'}
                              aria-pressed={section === value}
                              onClick={() => setSection(value)}
                            >
                              {t(`theme.studio.sectionsCopy.${value}`)}
                            </Button>
                          ))}
                        </ActionRow>
                      </nav>
                      <div hidden={section !== 'brand'}>
                        <ThemeBrandControls
                          document={document}
                          disabled={disabled || !!draft.recoverable}
                          onChange={history.change}
                        />
                      </div>
                      <div hidden={section !== 'style'}>
                        <ThemeStyleControls
                          document={document}
                          disabled={disabled || !!draft.recoverable}
                          onChange={history.change}
                        />
                      </div>
                      <div hidden={section !== 'assets'}>
                        <ThemeAssetFields
                          organizationId={organizationId}
                          assets={document.overrides.assets ?? {}}
                          disabled={disabled || !!draft.recoverable}
                          onUploadingChange={onUploadingChange}
                          onChange={(assets) =>
                            history.change({ ...document, overrides: { ...document.overrides, assets } })
                          }
                        />
                      </div>
                    </ContentStack>
                  </ElevatedPanel>
                </aside>
              </div>
            }
          >
            <div hidden={mobile && mobileView !== 'preview'}>
              <ThemeStudioPreview document={valid ?? lastValid} invalid={!valid} />
            </div>
          </SidebarLayout>
          <ConfirmDialog
            isOpen={blocker.blocked}
            title={t('theme.studio.leaveTitle')}
            message={t('theme.studio.leaveHelp')}
            confirmLabel={t('theme.studio.discardChanges')}
            cancelLabel={t('theme.studio.keepEditing')}
            onConfirm={() => {
              draft.clear();
              blocker.proceed();
            }}
            onCancel={blocker.reset}
          />
          <ConfirmDialog
            isOpen={reloadRequested}
            title={t('theme.studio.reloadSaved')}
            message={t('theme.studio.reloadHelp')}
            confirmLabel={t('theme.studio.discardAndReload')}
            cancelLabel={t('theme.studio.keepEditing')}
            onConfirm={() => {
              setReloadRequested(false);
              onReload();
            }}
            onCancel={() => setReloadRequested(false)}
          />
        </ContentStack>
      </div>
    </ThemeValidationContext>
  );
}
