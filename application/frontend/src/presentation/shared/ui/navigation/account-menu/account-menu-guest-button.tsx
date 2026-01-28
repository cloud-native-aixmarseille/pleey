import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { uiTypeScale } from '../../foundation/ui-typography';
import { AppIcon } from '../../icons/app-icon';

const signInButtonStyle = {
  ...uiTypeScale.label,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
  textDecoration: 'none',
} as const;

interface AccountMenuGuestButtonProps {
  readonly onSignIn: () => void;
}

export function AccountMenuGuestButton({ onSignIn }: AccountMenuGuestButtonProps) {
  const { t } = usePresentationTranslation();

  return (
    <button onClick={onSignIn} style={signInButtonStyle} type="button">
      <AppIcon name="sign-in" size={16} />
      {t('shared.shell.signInLink')}
    </button>
  );
}
