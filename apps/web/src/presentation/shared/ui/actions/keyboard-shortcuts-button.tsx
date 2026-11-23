import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { useKeyboardShortcutsState } from '../../keyboard';
import { AppIcon } from '../icons/app-icon';
import { Button } from './button';

export function KeyboardShortcutsButton() {
  const { openHelp } = useKeyboardShortcutsState();
  const { t } = usePresentationTranslation();

  return (
    <Button
      aria-label={t('shared.keyboard.shortcutsHelp')}
      intent="ghost"
      leftSection={<AppIcon name="command" size={16} />}
      onClick={openHelp}
      size="sm"
    >
      {t('shared.keyboard.helpButton')}
    </Button>
  );
}
