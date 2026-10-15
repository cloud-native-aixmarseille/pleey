import { useMemo, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemeId } from '../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { AsyncCombobox } from '../../shared/ui/forms/async-combobox';
import { FieldShell } from '../../shared/ui/forms/field-shell';
import { usePresentationThemeState } from '../../shared/ui/provider';
import { useWorkspaceThemePicker } from '../hooks/use-workspace-theme-picker';

const INHERIT_VALUE = '';

interface WorkspaceThemeFieldProps {
  readonly organizationId?: OrganizationId;
  readonly id: string;
  readonly value: ThemeId | null;
  readonly disabled?: boolean;
  readonly onChange: (id: ThemeId | null) => void;
}

export function WorkspaceThemePicker({
  organizationId,
  id,
  value,
  disabled,
  onChange,
  ariaDescribedBy,
}: WorkspaceThemeFieldProps & { readonly ariaDescribedBy?: string }) {
  const { t } = usePresentationTranslation();
  const { availableThemes } = usePresentationThemeState();
  const picker = useWorkspaceThemePicker(organizationId);
  const [selected, setSelected] = useState<{ id: ThemeId; name: string } | null>(null);

  const searchTerm = picker.search.trim().toLowerCase();
  const matchesSearch = (label: string) => searchTerm.length === 0 || label.toLowerCase().includes(searchTerm);

  const inheritLabel = t('theme.inherit');
  const curatedOptions = useMemo(
    () =>
      availableThemes
        .map((theme) => ({ value: String(theme.id), label: t(`theme.names.${theme.id}`) }))
        .filter((option) => matchesSearch(option.label)),
    [availableThemes, searchTerm, t],
  );

  const options = useMemo(() => {
    const orgOptions = picker.items.map((theme) => ({ value: String(theme.id), label: theme.document.name }));
    return [{ value: INHERIT_VALUE, label: inheritLabel }, ...curatedOptions, ...orgOptions];
  }, [curatedOptions, inheritLabel, picker.items]);

  const selectedLabel = useMemo(() => {
    if (value === null) return inheritLabel;
    const curated = availableThemes.find((theme) => theme.id === value);
    if (curated) return t(`theme.names.${value}`);
    if (selected?.id === value) return selected.name;
    const loaded = picker.items.find((theme) => theme.id === value);
    if (loaded) return loaded.document.name;
    return t('theme.builder.savedTheme');
  }, [availableThemes, inheritLabel, picker.items, selected, t, value]);

  const stateLabel = picker.error ? t('theme.builder.loadFailed') : t('theme.builder.empty');

  return (
    <AsyncCombobox
      id={id}
      ariaLabel={t('theme.label')}
      ariaDescribedBy={ariaDescribedBy}
      disabled={disabled}
      value={value ?? INHERIT_VALUE}
      selectedLabel={selectedLabel}
      placeholder={inheritLabel}
      options={options}
      isLoading={picker.isLoading}
      isLoadingMore={picker.isLoadingMore}
      hasMore={picker.hasMore}
      emptyLabel={stateLabel}
      noResultsLabel={stateLabel}
      loadingLabel={t('common.loading')}
      searchAriaLabel={t('theme.builder.search')}
      searchPlaceholder={t('theme.builder.search')}
      onDropdownOpen={picker.open}
      onSearchChange={picker.setSearch}
      onLoadMore={picker.loadMore}
      onChange={(next) => {
        if (next === null || next === INHERIT_VALUE) {
          onChange(null);
          return;
        }
        const match = picker.items.find((theme) => theme.id === next);
        if (match) {
          setSelected({ id: match.id, name: match.document.name });
        }
        onChange(next as ThemeId);
      }}
    />
  );
}

export function WorkspaceThemeSelectField({ id, ...props }: WorkspaceThemeFieldProps) {
  const { t } = usePresentationTranslation();
  const descriptionId = `${id}-description`;

  return (
    <FieldShell id={id} label={t('theme.label')} description={t('theme.description')} descriptionId={descriptionId}>
      <WorkspaceThemePicker id={id} ariaDescribedBy={descriptionId} {...props} />
    </FieldShell>
  );
}
