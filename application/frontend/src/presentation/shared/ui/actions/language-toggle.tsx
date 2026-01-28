import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { AppIcon } from '../icons/app-icon';

const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

const buttonStyle = {
  ...uiTypeScale.label,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  cursor: 'pointer',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xxs,
  justifyContent: 'center',
  minWidth: '2.6rem',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
} as const;

export function LanguageToggle() {
  const { currentLanguage, changeLanguage, t } = usePresentationTranslation();

  function handleToggle() {
    const currentIdx = SUPPORTED_LANGUAGES.indexOf(
      currentLanguage as (typeof SUPPORTED_LANGUAGES)[number],
    );
    const nextIdx = (currentIdx + 1) % SUPPORTED_LANGUAGES.length;
    changeLanguage(SUPPORTED_LANGUAGES[nextIdx]);
  }

  return (
    <button
      aria-label={t('shared.shell.languageToggle')}
      onClick={handleToggle}
      style={buttonStyle}
      type="button"
    >
      <AppIcon name="language" size={16} />
      {currentLanguage.toUpperCase()}
    </button>
  );
}
