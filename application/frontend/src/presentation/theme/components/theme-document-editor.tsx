import type { OrganizationId } from '../../../domains/organization/entities/organization';
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
import { CURATED_THEME_IDS } from '../../../domains/theme/entities/theme-id';
import { usePresentationFormPort } from '../../shared/forms/form-provider';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../shared/ui/forms/field-shell';
import { Input } from '../../shared/ui/forms/input';
import { Select } from '../../shared/ui/forms/select';
import { ContentStack } from '../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../shared/ui/layout/panels';
import { SupportingText } from '../../shared/ui/layout/typography';
import { PresentationThemePreview } from '../../shared/ui/provider';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { ThemeAssetFields } from './theme-asset-fields';
import { ThemeBrandSurface } from './theme-brand-surface';
import { ThemeColorScaleFields } from './theme-color-scale-fields';
import { ThemeTokenFields } from './theme-token-fields';
export function ThemeDocumentEditor({
  organizationId,
  disabled,
  onUploadingChange,
}: {
  readonly organizationId: OrganizationId;
  readonly disabled: boolean;
  readonly onUploadingChange: (value: boolean) => void;
}) {
  const { t } = usePresentationTranslation();
  const field = usePresentationFormPort().useFieldContext<ThemeDocument>();
  const { themeManagementFacade } = useWorkspaceDependencies();
  const document = field.state.value;
  const change = (overrides: ThemeOverrides) => field.handleChange({ ...document, overrides });
  let preview: ThemeDocument | null = null;
  try {
    preview = themeManagementFacade.normalize(document);
  } catch {
    /* The draft remains editable until it passes validation. */
  }
  return (
    <ContentStack>
      <Input
        label={t('theme.builder.name')}
        value={document.name}
        maxLength={80}
        disabled={disabled}
        onChange={(event) => field.handleChange({ ...document, name: event.target.value })}
      />
      <FieldShell id="theme-base" label={t('theme.builder.base')}>
        <Select
          id="theme-base"
          value={document.baseThemeId}
          disabled={disabled}
          onChange={(event) => {
            const baseThemeId = CURATED_THEME_IDS.find((id) => id === event.target.value);
            if (baseThemeId) field.handleChange({ ...document, baseThemeId });
          }}
        >
          {CURATED_THEME_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`theme.names.${id}`)}
            </option>
          ))}
        </Select>
      </FieldShell>
      <SupportingText>{t('theme.builder.help')}</SupportingText>
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
      {(
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
      ))}
      <ThemeAssetFields
        organizationId={organizationId}
        assets={document.overrides.assets ?? {}}
        disabled={disabled}
        onUploadingChange={onUploadingChange}
        onChange={(assets) => change({ ...document.overrides, assets })}
      />
      <StatusBanner tone="error">{!preview ? t('theme.errors.invalidDocument') : null}</StatusBanner>
      {preview &&
        (['light', 'dark'] as const).map((colorScheme) => (
          <section key={colorScheme} aria-label={t(`theme.builder.${colorScheme}`)}>
            <SupportingText>{t(`theme.builder.${colorScheme}`)}</SupportingText>
            <PresentationThemePreview document={preview} colorScheme={colorScheme}>
              <ThemeBrandSurface>
                <ElevatedPanel>
                  <ContentStack>
                    <SupportingText>{preview.name}</SupportingText>
                    <Input label={t('theme.builder.previewField')} defaultValue={t('theme.builder.previewText')} />
                    <Button>{t('theme.builder.previewAction')}</Button>
                    <StatusBanner tone="error">{t('theme.builder.previewError')}</StatusBanner>
                  </ContentStack>
                </ElevatedPanel>
              </ThemeBrandSurface>
            </PresentationThemePreview>
          </section>
        ))}
    </ContentStack>
  );
}
