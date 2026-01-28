import type { User } from '../../../../../domains/auth/entities/user';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { UserAvatar } from '../../data/user-avatar';
import { surfaceRecipes } from '../../foundation/ui-recipes';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { uiTypeScale } from '../../foundation/ui-typography';
import { AppIcon } from '../../icons/app-icon';

const wrapperStyle = {
  position: 'relative',
} as const;

const triggerStyle = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  cursor: 'pointer',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xxs}`,
} as const;

const usernameStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.primary,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const dropdownStyle = {
  ...surfaceRecipes.elevated,
  background: `${uiThemeTokens.color.surface.canvas}`,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xxs,
  minWidth: '12rem',
  padding: uiThemeTokens.spacing.xs,
  position: 'absolute',
  right: 0,
  top: '100%',
  zIndex: 300,
} as const;

const menuItemBaseStyle = {
  ...uiTypeScale.bodySmall,
  background: 'none',
  border: 'none',
  borderRadius: uiThemeTokens.radius.field,
  color: uiThemeTokens.color.text.primary,
  cursor: 'pointer',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
  textAlign: 'left',
  width: '100%',
} as const;

const dangerItemStyle = {
  ...menuItemBaseStyle,
  color: uiThemeTokens.color.text.danger,
} as const;

const dividerStyle = {
  border: 'none',
  borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
  margin: `${uiThemeTokens.spacing.xxs} 0`,
} as const;

const linkRowStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

interface AccountMenuAuthenticatedProps {
  readonly onNavigateToProfile: () => void;
  readonly onSignOut: () => void;
  readonly onToggle: () => void;
  readonly opened: boolean;
  readonly user: User;
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function AccountMenuAuthenticated({
  onNavigateToProfile,
  onSignOut,
  onToggle,
  opened,
  user,
  wrapperRef,
}: AccountMenuAuthenticatedProps) {
  const { t } = usePresentationTranslation();

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <button
        aria-expanded={opened}
        aria-haspopup="menu"
        aria-label={t('shared.shell.accountMenu')}
        onClick={onToggle}
        style={triggerStyle}
        type="button"
      >
        <UserAvatar alt={user.username} size={28} src={user.avatarUri} />
        <span style={usernameStyle}>{user.username}</span>
        <AppIcon name="chevron-down" size={16} />
      </button>

      {opened ? (
        <div role="menu" style={dropdownStyle}>
          <button
            onClick={onNavigateToProfile}
            role="menuitem"
            style={menuItemBaseStyle}
            type="button"
          >
            <span style={linkRowStyle}>
              <AppIcon name="profile" size={16} />
              <span>{t('shared.shell.profileLink')}</span>
            </span>
          </button>
          <hr style={dividerStyle} />
          <button onClick={onSignOut} role="menuitem" style={dangerItemStyle} type="button">
            <span style={linkRowStyle}>
              <AppIcon name="sign-out" size={16} />
              <span>{t('shared.shell.signOutAction')}</span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
