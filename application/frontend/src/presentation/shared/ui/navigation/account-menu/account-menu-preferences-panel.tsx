import { ColorSchemeToggle } from '../../actions/color-scheme-toggle';
import { KeyboardShortcutsButton } from '../../actions/keyboard-shortcuts-button';
import { LanguageToggle } from '../../actions/language-toggle';

const preferencesPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
} as const;

export function AccountMenuPreferencesPanel() {
  return (
    <div style={preferencesPanelStyle}>
      <KeyboardShortcutsButton />
      <LanguageToggle />
      <ColorSchemeToggle />
    </div>
  );
}
