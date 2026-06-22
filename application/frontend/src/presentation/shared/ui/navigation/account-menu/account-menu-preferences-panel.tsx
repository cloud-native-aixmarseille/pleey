import { ColorSchemeToggle } from '../../actions/color-scheme-toggle';
import { KeyboardShortcutsButton } from '../../actions/keyboard-shortcuts-button';
import { LanguageToggle } from '../../actions/language-toggle';
import { ContentStack } from '../../layout/containers';

export function AccountMenuPreferencesPanel() {
  return (
    <ContentStack gap="xs">
      <KeyboardShortcutsButton />
      <LanguageToggle />
      <ColorSchemeToggle />
    </ContentStack>
  );
}
