import { useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemeId } from '../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { useThemeLibrary } from '../hooks/use-theme-library';
import { ThemeLibraryResults } from './theme-library-results';
import { ThemeSelectField } from './theme-select-field';
export function WorkspaceThemeSelectField({
  organizationId,
  id,
  value,
  disabled,
  onChange,
}: {
  readonly organizationId?: OrganizationId;
  readonly id: string;
  readonly value: ThemeId | null;
  readonly disabled?: boolean;
  readonly onChange: (id: ThemeId | null) => void;
}) {
  const { t } = usePresentationTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const library = useThemeLibrary(organizationId, isOpen);
  const [selected, setSelected] = useState<{ id: ThemeId; name: string } | null>(null);
  return (
    <>
      <ThemeSelectField
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        customTheme={
          value?.startsWith('custom:')
            ? { id: value, name: selected?.id === value ? selected.name : t('theme.builder.savedTheme') }
            : undefined
        }
      />
      {organizationId && (
        <Button intent="ghost" disabled={disabled} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
          {t('theme.builder.browse')}
        </Button>
      )}
      {isOpen && !disabled && (
        <ThemeLibraryResults
          library={library}
          onSelect={(theme) => {
            setSelected({ id: theme.id, name: theme.document.name });
            onChange(theme.id);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
