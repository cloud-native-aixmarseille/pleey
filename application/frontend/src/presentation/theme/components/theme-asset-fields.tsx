import { useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemeOverrides } from '../../../domains/theme/entities/theme-document';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { FilePickerButton } from '../../shared/ui/forms/file-picker-button';
import { FormSectionFrame } from '../../shared/ui/forms/frames';
import { AppIcon } from '../../shared/ui/icons/app-icon';
import { ContentStack } from '../../shared/ui/layout/containers';
import { InsetPanel } from '../../shared/ui/layout/panels';
import { SupportingText } from '../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { themeBrandLogoStyle } from './theme-brand-surface.styles';
import { useThemeActionPermission } from './theme-permissions-context';
export function ThemeAssetFields({
  organizationId,
  assets,
  disabled,
  onChange,
  onUploadingChange,
}: {
  readonly organizationId: OrganizationId;
  readonly assets: NonNullable<ThemeOverrides['assets']>;
  readonly disabled: boolean;
  readonly onChange: (assets: ThemeOverrides['assets']) => void;
  readonly onUploadingChange: (value: boolean) => void;
}) {
  const { t } = usePresentationTranslation();
  const permission = useThemeActionPermission('uploadAsset');
  const uploadDisabled = disabled || !permission.allowed;
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [error, setError] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ kind: 'logoAssetId' | 'backgroundAssetId'; file: File } | null>(null);
  async function upload(kind: 'logoAssetId' | 'backgroundAssetId', file: File) {
    if (uploadDisabled) return;
    if (file.size > 5 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('theme.errors.invalidAsset');
      setRetry(null);
      return;
    }
    setError(null);
    setRetry(null);
    setUploadingKind(kind);
    onUploadingChange(true);
    try {
      const asset = await themeManagementFacade.upload(organizationId, file);
      onChange({ ...assets, [kind]: asset.id });
    } catch {
      permission.refresh?.();
      setError('theme.studio.uploadFailed');
      setRetry({ kind, file });
    } finally {
      onUploadingChange(false);
      setUploadingKind(null);
    }
  }
  return (
    <section aria-label={t('theme.builder.groups.assets')}>
      <ContentStack>
        <SupportingText>{t('theme.builder.assetHelp')}</SupportingText>
        <StatusBanner tone="error">{error ? t(error) : null}</StatusBanner>
        {retry && (
          <Button
            disabled={uploadDisabled}
            permission={permission.permission}
            permissionReason={permission.reason}
            onClick={() => void upload(retry.kind, retry.file)}
          >
            {t('theme.studio.retryUpload')}
          </Button>
        )}
        {(['logoAssetId', 'backgroundAssetId'] as const).map((kind) => (
          <FormSectionFrame key={kind} legend={t(`theme.builder.${kind}`)}>
            <InsetPanel>
              <ContentStack>
                {assets[kind] && (
                  <img
                    src={`/api/theme-assets/${assets[kind]}`}
                    style={themeBrandLogoStyle}
                    alt={t('theme.studio.assetPreview', { asset: t(`theme.builder.${kind}`) })}
                  />
                )}
                <FilePickerButton
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadDisabled}
                  inputProps={{ 'aria-label': t(`theme.builder.${kind}`) }}
                  onSelect={(file) => {
                    if (file) void upload(kind, file);
                  }}
                >
                  {(props) => (
                    <Button
                      {...props}
                      size="sm"
                      intent="secondary"
                      disabled={uploadDisabled}
                      permission={permission.permission}
                      permissionReason={permission.reason}
                      leftSection={<AppIcon name="image" />}
                    >
                      {t(`theme.builder.${kind}`)}
                    </Button>
                  )}
                </FilePickerButton>
                {uploadingKind === kind && (
                  <div role="status">
                    <SupportingText>{t('theme.studio.uploading')}</SupportingText>
                    <progress aria-label={t('theme.studio.uploading')} />
                  </div>
                )}
                {assets[kind] && (
                  <Button intent="ghost" disabled={disabled} onClick={() => onChange({ ...assets, [kind]: null })}>
                    {t('theme.builder.removeAsset', { asset: t(`theme.builder.${kind}`) })}
                  </Button>
                )}
              </ContentStack>
            </InsetPanel>
          </FormSectionFrame>
        ))}
      </ContentStack>
    </section>
  );
}
