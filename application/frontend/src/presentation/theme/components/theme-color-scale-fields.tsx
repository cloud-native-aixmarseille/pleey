import type { ThemeColorScale, ThemeDocument, ThemeOverrides } from '../../../domains/theme/entities/theme-document';
import { CURATED_THEME_PALETTES } from '../../../domains/theme/services/curated-theme-palettes';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { Input } from '../../shared/ui/forms/input';
import { ContentStack } from '../../shared/ui/layout/containers';
export function ThemeColorScaleFields({
  document,
  disabled,
  onChange,
}: {
  readonly document: ThemeDocument;
  readonly disabled: boolean;
  readonly onChange: (scales: ThemeOverrides['colorScales']) => void;
}) {
  const { t } = usePresentationTranslation();
  return (
    <details>
      <summary>{t('theme.builder.groups.colorScales')}</summary>
      <ContentStack>
        {(['accent', 'highlight', 'success'] as const).map((group) => (
          <details key={group}>
            <summary>{t(`theme.builder.tokens.${group}`)}</summary>
            <ContentStack>
              {(
                document.overrides.colorScales?.[group] ??
                CURATED_THEME_PALETTES[document.baseThemeId].colorScales[group]
              ).map((value, index) => (
                <Input
                  key={String(index)}
                  label={t('theme.builder.shade', { index: String(index + 1) })}
                  type="color"
                  value={value}
                  disabled={disabled}
                  onChange={(event) => {
                    const colors = [
                      ...(document.overrides.colorScales?.[group] ??
                        CURATED_THEME_PALETTES[document.baseThemeId].colorScales[group]),
                    ];
                    colors[index] = event.target.value;
                    onChange({ ...document.overrides.colorScales, [group]: colors as unknown as ThemeColorScale });
                  }}
                />
              ))}
              <Button
                disabled={disabled}
                intent="ghost"
                onClick={() => onChange({ ...document.overrides.colorScales, [group]: undefined })}
              >
                {t('theme.builder.reset')}
              </Button>
            </ContentStack>
          </details>
        ))}
      </ContentStack>
    </details>
  );
}
