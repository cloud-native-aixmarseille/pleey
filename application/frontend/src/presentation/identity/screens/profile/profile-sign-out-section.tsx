import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { SupportingText } from '../../../shared/ui/layout/typography';
import { AuthActionPanel } from '../shared/components/auth-shell-primitives';

interface ProfileSignOutSectionProps {
  readonly onSignOut: () => Promise<void> | void;
}

export function ProfileSignOutSection({ onSignOut }: ProfileSignOutSectionProps) {
  const { t } = usePresentationTranslation();

  return (
    <AuthActionPanel>
      <SupportingText>{t('auth.profile.signOutDescription')}</SupportingText>
      <Button intent="ghost" onClick={() => void onSignOut()}>
        {t('auth.profile.signOutCta')}
      </Button>
    </AuthActionPanel>
  );
}
