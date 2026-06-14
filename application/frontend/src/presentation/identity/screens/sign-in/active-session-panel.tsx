import type { User } from '../../../../domains/identity/entities/user';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { ActionRow } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { Eyebrow, Heading, SupportingText } from '../../../shared/ui/layout/typography';

interface ActiveSessionPanelProps {
  readonly user: User;
  readonly onNavigateDashboard: () => void;
  readonly onSignOut: () => void;
}

export function ActiveSessionPanel({
  user,
  onNavigateDashboard,
  onSignOut,
}: ActiveSessionPanelProps) {
  const { t } = usePresentationTranslation();

  return (
    <InsetPanel padding="lg" tone="success">
      <div>
        <Eyebrow compact tone="success">
          {t('auth.signIn.activeSession.eyebrow')}
        </Eyebrow>
        <Heading level={3}>
          {t('auth.signIn.activeSession.title', { username: user.username })}
        </Heading>
        <SupportingText marginTop="xs">{t('auth.signIn.activeSession.description')}</SupportingText>
      </div>
      <ActionRow>
        <Button intent="secondary" onClick={onNavigateDashboard}>
          {t('auth.signIn.activeSession.dashboardCta')}
        </Button>
        <Button intent="ghost" onClick={onSignOut}>
          {t('auth.signIn.activeSession.signOutCta')}
        </Button>
      </ActionRow>
    </InsetPanel>
  );
}
