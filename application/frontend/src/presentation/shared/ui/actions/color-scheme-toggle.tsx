import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { AppIcon } from '../icons/app-icon';
import { usePresentationThemeState } from '../provider';
import { Button } from './button';

export function ColorSchemeToggle() {
  const { t } = usePresentationTranslation();
  const { activeColorScheme, setActiveColorScheme } = usePresentationThemeState();

  function handleToggle() {
    setActiveColorScheme(activeColorScheme === 'dark' ? 'light' : 'dark');
  }

  const label =
    activeColorScheme === 'dark'
      ? t('shared.shell.colorSchemeLight')
      : t('shared.shell.colorSchemeDark');
  const iconName = activeColorScheme === 'dark' ? 'light-mode' : 'dark-mode';

  return (
    <Button
      aria-label={t('shared.shell.colorSchemeToggle')}
      intent="ghost"
      leftSection={<AppIcon name={iconName} size={16} />}
      onClick={handleToggle}
      size="sm"
      type="button"
    >
      {label}
    </Button>
  );
}
