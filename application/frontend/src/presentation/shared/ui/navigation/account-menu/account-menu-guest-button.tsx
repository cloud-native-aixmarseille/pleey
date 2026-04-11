import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { AppIcon } from '../../icons/app-icon';
import { AccountMenuActionRow, AccountMenuTriggerButton } from './account-menu-primitives';

interface AccountMenuGuestButtonProps {
  readonly onSignIn: () => void;
}

export function AccountMenuGuestButton({ onSignIn }: AccountMenuGuestButtonProps) {
  const { t } = usePresentationTranslation();

  return (
    <AccountMenuTriggerButton aria-label={t('shared.shell.signInLink')} onClick={onSignIn}>
      <AccountMenuActionRow>
        <AppIcon name="sign-in" size={16} />
        <span>{t('shared.shell.signInLink')}</span>
      </AccountMenuActionRow>
    </AccountMenuTriggerButton>
  );
}
