import { THEME_FONT_FAMILIES, type ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { FormSectionFrame } from '../../shared/ui/forms/frames';
import { ActionRow, ContentStack } from '../../shared/ui/layout/containers';
import { SupportingText } from '../../shared/ui/layout/typography';
import { ThemeAdvancedFields } from './theme-advanced-fields';
import { themeFontSampleStyle } from './theme-style-controls.styles';
import { THEME_STYLE_PRESETS } from './theme-style-presets';

export function ThemeStyleControls({
  document,
  disabled,
  onChange,
}: {
  readonly document: ThemeDocument;
  readonly disabled: boolean;
  readonly onChange: (document: ThemeDocument) => void;
}) {
  const { t } = usePresentationTranslation();
  const typography = document.overrides.typography;
  return (
    <ContentStack gap="lg">
      <FormSectionFrame
        legend={t('theme.studio.typography')}
        description={!typography ? t('theme.builder.inherited') : undefined}
      >
        <ContentStack gap="sm">
          {THEME_FONT_FAMILIES.map((font, index) => {
            const selected = typography?.body === font && typography?.display === font;
            return (
              <Button
                size="sm"
                width="full"
                key={font}
                disabled={disabled}
                intent={selected ? 'secondary' : 'ghost'}
                aria-pressed={selected}
                leftSection={
                  <span style={themeFontSampleStyle(font)} aria-hidden>
                    {t('theme.studio.typeSample')}
                  </span>
                }
                onClick={() =>
                  onChange({
                    ...document,
                    overrides: { ...document.overrides, typography: { ...typography, body: font, display: font } },
                  })
                }
              >
                {t(`theme.studio.fonts.${index}`)}
              </Button>
            );
          })}
        </ContentStack>
        {typography && (
          <Button
            size="sm"
            intent="ghost"
            disabled={disabled}
            onClick={() => onChange({ ...document, overrides: { ...document.overrides, typography: undefined } })}
          >
            {t('theme.studio.resetTypography')}
          </Button>
        )}
      </FormSectionFrame>
      {(['radius', 'spacing', 'motion'] as const).map((group) => {
        const values = document.overrides[group];
        const choices = Object.entries(THEME_STYLE_PRESETS[group]);
        const matches = (preset: Record<string, string>) =>
          Object.entries(preset).every(([key, value]) => values?.[key as keyof typeof values] === value);
        const description =
          values && !choices.some(([, preset]) => matches(preset))
            ? t('theme.studio.custom')
            : !values
              ? t('theme.builder.inherited')
              : undefined;
        return (
          <FormSectionFrame key={group} legend={t(`theme.builder.groups.${group}`)} description={description}>
            <div role="group" aria-label={t(`theme.builder.groups.${group}`)}>
              <ActionRow gap="xs">
                {choices.map(([name, preset]) => (
                  <Button
                    size="sm"
                    key={name}
                    disabled={disabled}
                    intent={matches(preset) ? 'secondary' : 'ghost'}
                    aria-pressed={matches(preset)}
                    onClick={() => onChange({ ...document, overrides: { ...document.overrides, [group]: preset } })}
                  >
                    {t(`theme.studio.presets.${name}`)}
                  </Button>
                ))}
              </ActionRow>
            </div>
          </FormSectionFrame>
        );
      })}
      <SupportingText>{t('theme.studio.motionHelp')}</SupportingText>
      <ThemeAdvancedFields section="style" document={document} disabled={disabled} onChange={onChange} />
    </ContentStack>
  );
}
