import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { AppIcon } from '../icons/app-icon';
import { usePresentationThemeState } from '../provider';

const buttonStyle = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  cursor: 'pointer',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xxs,
  justifyContent: 'center',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
} as const;

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
    <button
      aria-label={t('shared.shell.colorSchemeToggle')}
      onClick={handleToggle}
      style={buttonStyle}
      type="button"
    >
      <AppIcon name={iconName} size={16} />
      {label}
    </button>
  );
}
