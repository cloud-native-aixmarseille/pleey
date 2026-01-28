import type { User } from '../../../../domains/auth/entities/user';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { UserAvatar } from '../../../shared/ui/data/user-avatar';
import {
  authAvatarFrameStyle,
  authProfileIdentityStyle,
} from '../../../shared/ui/foundation/ui-theme';
import { Heading } from '../../../shared/ui/layout/typography';

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
    <div style={authProfileIdentityStyle}>
      <UserAvatar src={user.avatarUri} alt={user.username} style={authAvatarFrameStyle} />
      <Heading level={3}>{user.username}</Heading>
      <Button intent="outline" onClick={() => void onRegenerateAvatar()} disabled={isRegenerating}>
        {isRegenerating
          ? t('auth.profile.avatarSection.regeneratingCta')
          : t('auth.profile.avatarSection.regenerateCta')}
      </Button>
    </div>
  );
}
