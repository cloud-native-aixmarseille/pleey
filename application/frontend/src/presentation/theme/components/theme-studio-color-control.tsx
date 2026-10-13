import type { ThemeColorScale, ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { CURATED_THEME_PALETTES } from '../../../domains/theme/services/curated-theme-palettes';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { FormSectionFrame } from '../../shared/ui/forms/frames';
import { Input } from '../../shared/ui/forms/input';
import { ActionRow, ResponsiveGrid } from '../../shared/ui/layout/containers';
import { SupportingText } from '../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { ThemePalettePreview } from './theme-palette-preview';
import { useThemeFieldValidation } from './theme-validation-context';

const SUGGESTED_COLORS = ['#7952e8', '#256bdb', '#227667', '#b04767', '#bf632b', '#55516a'] as const;

export function ThemeStudioColorControl({
  group,
  document,
  disabled,
  onChange,
}: {
  readonly group: 'accent' | 'highlight';
  readonly document: ThemeDocument;
  readonly disabled: boolean;
  readonly onChange: (document: ThemeDocument, group?: string) => void;
}) {
  const { t } = usePresentationTranslation();
  const validation = useThemeFieldValidation(`colorScales.${group}`);
  const { themeManagementFacade } = useWorkspaceDependencies();
  const scale =
    document.overrides.colorScales?.[group] ?? CURATED_THEME_PALETTES[document.baseThemeId].colorScales[group];
  const color = scale[5];
  const valid = /^#[0-9a-f]{6}$/i.test(color);
  const changeColor = (value: string) => {
    if (/^#[0-9a-f]{6}$/i.test(value)) {
      onChange(themeManagementFacade.applyColor(document, group, value), group);
    } else {
      const values = [...scale];
      values[5] = value;
      onChange(
        {
          ...document,
          overrides: {
            ...document.overrides,
            colorScales: { ...document.overrides.colorScales, [group]: values as unknown as ThemeColorScale },
          },
        },
        group,
      );
    }
  };
  return (
    <FormSectionFrame legend={t(`theme.studio.colors.${group}`)}>
      <ResponsiveGrid columns={{ base: 2 }} gap="sm">
        <Input
          type="color"
          label={t(`theme.studio.colors.${group}`)}
          aria-label={t(`theme.studio.colors.${group}`)}
          value={valid ? color : '#7952e8'}
          disabled={disabled}
          onChange={(event) => changeColor(event.target.value)}
        />
        <Input
          label={t('theme.studio.hex', { color: t(`theme.studio.colors.${group}`) })}
          {...validation}
          value={color}
          maxLength={7}
          invalid={!valid}
          disabled={disabled}
          onChange={(event) => changeColor(event.target.value)}
          compact
        />
      </ResponsiveGrid>
      {group === 'accent' && (
        <div role="group" aria-label={t('theme.studio.suggestedColors')}>
          <ActionRow gap="xs">
            {SUGGESTED_COLORS.map((value, index) => (
              <Button
                key={value}
                type="button"
                disabled={disabled}
                aria-label={t(`theme.studio.swatches.${index}`)}
                size="sm"
                intent="ghost"
                onClick={() => changeColor(value)}
              >
                {t(`theme.studio.swatches.${index}`)}
              </Button>
            ))}
          </ActionRow>
        </div>
      )}
      <ThemePalettePreview colors={scale} />
      <SupportingText size="sm">{t('theme.studio.paletteHelp')}</SupportingText>
    </FormSectionFrame>
  );
}
