import { useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemeOverrides } from '../../../domains/theme/entities/theme-document';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { Input } from '../../shared/ui/forms/input';
import { ContentStack } from '../../shared/ui/layout/containers';
import { SupportingText } from '../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
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
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [error, setError] = useState(false);
  async function upload(kind: 'logoAssetId' | 'backgroundAssetId', file: File) {
    if (file.size > 5 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(true);
      return;
    }
    setError(false);
    onUploadingChange(true);
    try {
      const asset = await themeManagementFacade.upload(organizationId, file);
      onChange({ ...assets, [kind]: asset.id });
    } catch {
      setError(true);
    } finally {
      onUploadingChange(false);
    }
  }
  return (
    <details>
      <summary>{t('theme.builder.groups.assets')}</summary>
      <ContentStack>
        <SupportingText>{t('theme.builder.assetHelp')}</SupportingText>
        <StatusBanner tone="error">{error ? t('theme.errors.invalidAsset') : null}</StatusBanner>
        {(['logoAssetId', 'backgroundAssetId'] as const).map((kind) => (
          <ContentStack key={kind}>
            <Input
              type="file"
              label={t(`theme.builder.${kind}`)}
              accept="image/png,image/jpeg,image/webp"
              disabled={disabled}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (file) void upload(kind, file);
              }}
            />
            {assets[kind] && (
              <Button intent="ghost" disabled={disabled} onClick={() => onChange({ ...assets, [kind]: null })}>
                {t('theme.builder.removeAsset', { asset: t(`theme.builder.${kind}`) })}
              </Button>
            )}
          </ContentStack>
        ))}
      </ContentStack>
    </details>
  );
}
