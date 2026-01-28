import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';

const identityHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
};

const identityIconStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '50%',
  display: 'flex',
  flexShrink: 0,
  height: 36,
  justifyContent: 'center',
  width: 36,
};

const identityTitleGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
};

const identityEyebrowStyle: CSSProperties = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.accent,
  margin: 0,
  textTransform: 'uppercase',
};

const identityTitleStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

const identityDescStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
};

interface JoinGameEntryIdentityProps {
  readonly isAuthenticated: boolean;
  readonly showGuestStep: boolean;
  readonly userName: string | null;
}

export function JoinGameEntryIdentity({
  isAuthenticated,
  showGuestStep,
  userName,
}: JoinGameEntryIdentityProps) {
  const { t } = usePresentationTranslation();

  const identityIcon: 'account' | 'profile' | 'game' = isAuthenticated
    ? 'account'
    : showGuestStep
      ? 'profile'
      : 'game';

  const identityTitle = isAuthenticated
    ? t('game.join.identity.authenticatedEyebrow')
    : showGuestStep
      ? t('game.join.identity.guestEyebrow')
      : t('game.join.identity.awaitingEyebrow');

  const identityHeading = isAuthenticated
    ? t('game.join.identity.authenticatedTitle', {
        username: userName ?? t('game.join.identity.fallbackName'),
      })
    : showGuestStep
      ? t('game.join.identity.guestTitle')
      : t('game.join.identity.awaitingTitle');

  const identityDescription = isAuthenticated
    ? t('game.join.identity.authenticatedDescription')
    : showGuestStep
      ? t('game.join.identity.guestDescription')
      : t('game.join.identity.awaitingDescription');

  return (
    <>
      <div style={identityHeaderStyle}>
        <div style={identityIconStyle}>
          <AppIcon name={identityIcon} size={18} />
        </div>
        <div style={identityTitleGroupStyle}>
          <p style={identityEyebrowStyle}>{identityTitle}</p>
          <h3 style={identityTitleStyle}>{identityHeading}</h3>
        </div>
      </div>

      <p style={identityDescStyle}>{identityDescription}</p>
    </>
  );
}
