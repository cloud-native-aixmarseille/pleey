import { useId } from 'react';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { FieldShell } from '../../shared/ui/forms/field-shell';
import { Input } from '../../shared/ui/forms/input';
import { Select } from '../../shared/ui/forms/select';
import { ContentStack } from '../../shared/ui/layout/containers';
export function ThemeTokenFields({
  group,
  keys,
  values,
  choices,
  disabled,
  onChange,
}: {
  readonly group: string;
  readonly keys: readonly string[];
  readonly values: Readonly<Record<string, string | undefined>>;
  readonly choices?: readonly string[];
  readonly disabled: boolean;
  readonly onChange: (key: string, value: string | undefined) => void;
}) {
  const { t } = usePresentationTranslation();
  const id = useId();
  return (
    <details>
      <summary>{t(`theme.builder.groups.${group}`)}</summary>
      <ContentStack>
        {keys.map((key) => (
          <FieldShell key={key} id={`${id}-${key}`} label={t(`theme.builder.tokens.${key}`)}>
            {choices ? (
              <Select
                id={`${id}-${key}`}
                value={values[key] ?? ''}
                disabled={disabled}
                onChange={(event) => onChange(key, event.target.value || undefined)}
              >
                <option value="">{t('theme.builder.inherited')}</option>
                {choices.map((choice, index) => (
                  <option key={choice} value={choice}>
                    {t(`theme.builder.fonts.${index}`)}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={`${id}-${key}`}
                value={values[key] ?? ''}
                disabled={disabled}
                placeholder={t(`theme.builder.hints.${group}`)}
                onChange={(event) => onChange(key, event.target.value || undefined)}
              />
            )}
          </FieldShell>
        ))}
      </ContentStack>
    </details>
  );
}
