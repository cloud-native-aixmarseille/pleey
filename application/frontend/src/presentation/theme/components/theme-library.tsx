import { useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { ContentStack } from '../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../shared/ui/layout/panels';
import { useThemeLibrary } from '../hooks/use-theme-library';
import { ThemeBuilderDialog } from './theme-builder-dialog';
import { ThemeLibraryResults } from './theme-library-results';
export function ThemeLibrary({ organizationId }: { readonly organizationId: OrganizationId }) {
  const { t } = usePresentationTranslation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedTheme | null | undefined>(undefined);
  const library = useThemeLibrary(organizationId, open);
  return (
    <ElevatedPanel>
      <ContentStack>
        <Button intent="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
          {t('theme.builder.library')}
        </Button>
        {open && (
          <>
            <Button onClick={() => setEditing(null)}>{t('theme.builder.create')}</Button>
            <ThemeLibraryResults library={library} onSelect={setEditing} />
          </>
        )}
        {editing !== undefined && (
          <ThemeBuilderDialog
            organizationId={organizationId}
            theme={editing}
            onClose={() => setEditing(undefined)}
            onSaved={() => {
              setEditing(undefined);
              library.reload();
            }}
          />
        )}
      </ContentStack>
    </ElevatedPanel>
  );
}
