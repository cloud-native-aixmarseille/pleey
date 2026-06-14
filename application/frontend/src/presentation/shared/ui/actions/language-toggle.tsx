import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { AppIcon } from '../icons/app-icon';
import { Button } from './button';

const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

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
    <Button
      aria-label={t('shared.shell.languageToggle')}
      intent="ghost"
      leftSection={<AppIcon name="language" size={16} />}
      onClick={handleToggle}
      size="sm"
      type="button"
    >
      {currentLanguage.toUpperCase()}
    </Button>
  );
}
