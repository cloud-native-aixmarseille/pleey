import { useState } from 'react';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { CURATED_THEME_IDS, type CuratedThemeId } from '../../../domains/theme/entities/theme-id';
import { CURATED_THEME_PALETTES } from '../../../domains/theme/services/curated-theme-palettes';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { FormSectionFrame } from '../../shared/ui/forms/frames';
import { AppIcon } from '../../shared/ui/icons/app-icon';
import { ContentStack } from '../../shared/ui/layout/containers';
import { ConfirmDialog } from '../../shared/ui/overlay/confirm-dialog';
import { ThemeAdvancedFields } from './theme-advanced-fields';
import { ThemePalettePreview } from './theme-palette-preview';
import { ThemeStudioColorControl } from './theme-studio-color-control';

export function ThemeBrandControls({
  document,
  disabled,
  onChange,
}: {
  readonly document: ThemeDocument;
  readonly disabled: boolean;
  readonly onChange: (document: ThemeDocument, group?: string) => void;
}) {
  const { t } = usePresentationTranslation();
  const [pendingBase, setPendingBase] = useState<CuratedThemeId | null>(null);
  const switchBase = (baseThemeId: CuratedThemeId) => {
    if (Object.keys(document.overrides).length) setPendingBase(baseThemeId);
    else onChange({ ...document, baseThemeId });
  };
  const applyBase = (keep: boolean) => {
    if (pendingBase) onChange({ ...document, baseThemeId: pendingBase, overrides: keep ? document.overrides : {} });
    setPendingBase(null);
  };
  return (
    <ContentStack gap="lg">
      <FormSectionFrame legend={t('theme.studio.startingPoint')}>
        <div role="group" aria-label={t('theme.builder.base')}>
          <ContentStack gap="sm">
            {CURATED_THEME_IDS.map((id) => (
              <ContentStack gap="xs" key={id}>
                <ThemePalettePreview colors={CURATED_THEME_PALETTES[id].colorScales.accent} />
                <Button
                  width="full"
                  size="sm"
                  intent={document.baseThemeId === id ? 'secondary' : 'ghost'}
                  disabled={disabled}
                  aria-pressed={document.baseThemeId === id}
                  onClick={() => switchBase(id)}
                  leftSection={document.baseThemeId === id ? <AppIcon name="success" size={16} /> : undefined}
                >
                  {t(`theme.names.${id}`)}
                </Button>
              </ContentStack>
            ))}
          </ContentStack>
        </div>
      </FormSectionFrame>
      <ThemeStudioColorControl group="accent" document={document} disabled={disabled} onChange={onChange} />
      <ThemeStudioColorControl group="highlight" document={document} disabled={disabled} onChange={onChange} />
      <ThemeAdvancedFields section="brand" document={document} disabled={disabled} onChange={onChange} />
      <ConfirmDialog
        isOpen={pendingBase !== null}
        title={t('theme.studio.switchStarter')}
        message={t('theme.studio.switchStarterHelp')}
        confirmLabel={t('theme.studio.keepCustomizations')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => applyBase(true)}
        onCancel={() => setPendingBase(null)}
      >
        <Button intent="secondary" onClick={() => applyBase(false)}>
          {t('theme.studio.startFresh')}
        </Button>
      </ConfirmDialog>
    </ContentStack>
  );
}
