import {
  THEME_BORDER_KEYS,
  THEME_FONT_FAMILIES,
  THEME_MOTION_KEYS,
  THEME_RADIUS_KEYS,
  THEME_SPACING_KEYS,
  THEME_SURFACE_KEYS,
  THEME_TEXT_KEYS,
  THEME_TYPOGRAPHY_KEYS,
  type ThemeDocument,
  type ThemeOverrides,
} from '../../../domains/theme/entities/theme-document';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { ContentStack } from '../../shared/ui/layout/containers';
import { SupportingText } from '../../shared/ui/layout/typography';
import { ThemeColorScaleFields } from './theme-color-scale-fields';
import { ThemeTokenFields } from './theme-token-fields';

export function ThemeAdvancedFields({
  section,
  document,
  disabled,
  onChange,
}: {
  readonly section: 'brand' | 'style';
  readonly document: ThemeDocument;
  readonly disabled: boolean;
  readonly onChange: (document: ThemeDocument) => void;
}) {
  const { t } = usePresentationTranslation();
  const change = (overrides: ThemeOverrides) => onChange({ ...document, overrides });
  return (
    <details>
      <summary>{t(`theme.studio.advanced.${section}`)}</summary>
      <ContentStack marginTop="sm">
        <SupportingText>{t('theme.builder.help')}</SupportingText>
        {section === 'brand' ? (
          <>
            <ThemeColorScaleFields
              document={document}
              disabled={disabled}
              onChange={(colorScales) => change({ ...document.overrides, colorScales })}
            />
            {(['light', 'dark'] as const).map((scheme) => (
              <details key={scheme}>
                <summary>{t(`theme.builder.${scheme}`)}</summary>
                {(
                  [
                    ['surface', THEME_SURFACE_KEYS],
                    ['text', THEME_TEXT_KEYS],
                    ['border', THEME_BORDER_KEYS],
                  ] as const
                ).map(([group, keys]) => (
                  <ThemeTokenFields
                    key={group}
                    group={group}
                    path={`semantic.${scheme}.${group}`}
                    keys={keys}
                    values={document.overrides.semantic?.[scheme]?.[group] ?? {}}
                    disabled={disabled}
                    onChange={(key, value) =>
                      change({
                        ...document.overrides,
                        semantic: {
                          ...document.overrides.semantic,
                          [scheme]: {
                            ...document.overrides.semantic?.[scheme],
                            [group]: { ...document.overrides.semantic?.[scheme]?.[group], [key]: value },
                          },
                        },
                      })
                    }
                  />
                ))}
              </details>
            ))}
          </>
        ) : (
          (
            [
              ['radius', THEME_RADIUS_KEYS],
              ['spacing', THEME_SPACING_KEYS],
              ['motion', THEME_MOTION_KEYS],
              ['typography', THEME_TYPOGRAPHY_KEYS],
            ] as const
          ).map(([group, keys]) => (
            <ThemeTokenFields
              key={group}
              group={group}
              keys={keys}
              values={document.overrides[group] ?? {}}
              disabled={disabled}
              choices={group === 'typography' ? THEME_FONT_FAMILIES : undefined}
              onChange={(key, value) =>
                change({ ...document.overrides, [group]: { ...document.overrides[group], [key]: value } })
              }
            />
          ))
        )}
      </ContentStack>
    </details>
  );
}
