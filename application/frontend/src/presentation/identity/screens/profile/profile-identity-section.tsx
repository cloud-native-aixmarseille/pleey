import type { User } from '../../../../domains/identity/entities/user';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { Heading } from '../../../shared/ui/layout/typography';
import {
  AuthFramedAvatar,
  AuthProfileIdentityPanel,
} from '../shared/components/auth-shell-primitives';

interface ProfileIdentitySectionProps {
  readonly isRegenerating: boolean;
  readonly onRegenerateAvatar: () => Promise<void>;
  readonly user: User;
}

export function ProfileIdentitySection({
  isRegenerating,
  onRegenerateAvatar,
  user,
}: ProfileIdentitySectionProps) {
  const { t } = usePresentationTranslation();

  return (
    <AuthProfileIdentityPanel>
      <AuthFramedAvatar alt={user.username} src={user.avatarUri} />
      <Heading level={3}>{user.username}</Heading>
      <Button intent="outline" onClick={() => void onRegenerateAvatar()} disabled={isRegenerating}>
        {isRegenerating
          ? t('auth.profile.avatarSection.regeneratingCta')
          : t('auth.profile.avatarSection.regenerateCta')}
      </Button>
    </AuthProfileIdentityPanel>
  );
}
