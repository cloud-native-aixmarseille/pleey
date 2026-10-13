import type { ThemeId } from '../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { FieldShell } from '../../shared/ui/forms/field-shell';
import { Select } from '../../shared/ui/forms/select';
import { usePresentationThemeState } from '../../shared/ui/provider';

interface ThemeSelectFieldProps {
  readonly customTheme?: { readonly id: ThemeId; readonly name: string };
  readonly id: string;
  readonly value: ThemeId | null;
  readonly disabled?: boolean;
  readonly onChange: (themeId: ThemeId | null) => void;
}

export function ThemeSelectField({ id, value, disabled, onChange, customTheme }: ThemeSelectFieldProps) {
  const { t } = usePresentationTranslation();
  const { availableThemes } = usePresentationThemeState();
  const descriptionId = `${id}-description`;

  return (
    <FieldShell id={id} label={t('theme.label')} description={t('theme.description')} descriptionId={descriptionId}>
      <Select
        id={id}
        value={value ?? ''}
        disabled={disabled}
        aria-describedby={descriptionId}
        onChange={(event) =>
          onChange(
            customTheme?.id === event.target.value
              ? customTheme.id
              : (availableThemes.find((theme) => theme.id === event.target.value)?.id ?? null),
          )
        }
      >
        <option value="">{t('theme.inherit')}</option>
        {customTheme && <option value={customTheme.id}>{customTheme.name}</option>}
        {availableThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {t(`theme.names.${theme.id}`)}
          </option>
        ))}
      </Select>
    </FieldShell>
  );
}
