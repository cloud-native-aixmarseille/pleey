import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { authAccountActionsStyle } from '../../../shared/ui/foundation/ui-theme';
import { SupportingText } from '../../../shared/ui/layout/typography';

interface ProfileSignOutSectionProps {
  readonly onSignOut: () => Promise<void> | void;
}

export function ProfileSignOutSection({ onSignOut }: ProfileSignOutSectionProps) {
  const { t } = usePresentationTranslation();

  return (
    <div style={authAccountActionsStyle}>
      <SupportingText>{t('auth.profile.signOutDescription')}</SupportingText>
      <Button intent="ghost" onClick={() => void onSignOut()}>
        {t('auth.profile.signOutCta')}
      </Button>
    </div>
  );
}
