import type { DashboardGameListItem } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import type { DashboardActiveSessionItem } from '../../../../../../domains/game-session/entities/active-game-session';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { DashboardActiveSessionBannerActions } from './dashboard-active-session-banner-actions';
import { resolveDashboardActiveSessionBannerState } from './dashboard-active-session-banner-state';

interface DashboardActiveSessionBannerProps {
  readonly gameTypeDescriptor: GameTypeDescriptor | undefined;
  readonly isActionPending: boolean;
  readonly onOpenSession: (session: DashboardActiveSessionItem) => void;
  readonly onResumeSession: () => Promise<void>;
  readonly onStopSession: () => Promise<void>;
  readonly session: DashboardActiveSessionItem;
  readonly sessionGame: DashboardGameListItem | null;
}

const bannerBaseStyle = {
  alignItems: 'center' as const,
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: uiThemeTokens.spacing.sm,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
} as const;

const metaStyle = {
  alignItems: 'center' as const,
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap' as const,
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
};

const titleStyle = {
  color: uiThemeTokens.color.text.primary,
  fontWeight: 700,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

const pinStyle = {
  color: uiThemeTokens.color.text.secondary,
  fontSize: '0.85rem',
};

export function DashboardActiveSessionBanner({
  gameTypeDescriptor,
  isActionPending,
  onOpenSession,
  onResumeSession,
  onStopSession,
  session,
  sessionGame,
}: DashboardActiveSessionBannerProps) {
  const { t } = usePresentationTranslation();
  const bannerState = resolveDashboardActiveSessionBannerState({
    gameTypeDescriptor,
    session,
    sessionGame,
    t,
  });

  return (
    <div
      aria-label={t('dashboard.sessions.title')}
      role="region"
      style={{ ...bannerBaseStyle, ...bannerState.bannerStyle }}
    >
      <AppIcon name={bannerState.iconName} size={18} />

      <div style={metaStyle}>
        <Badge tone={bannerState.statusTone}>{bannerState.statusLabel}</Badge>
        {bannerState.roleLabel ? <Badge tone="info">{bannerState.roleLabel}</Badge> : null}
        {bannerState.typeLabel ? <Badge tone="accent">{bannerState.typeLabel}</Badge> : null}
        <span style={titleStyle}>{bannerState.title}</span>
        <span style={pinStyle}>{t('dashboard.sessions.pin', { pin: session.pin })}</span>
      </div>

      <DashboardActiveSessionBannerActions
        isActionPending={isActionPending}
        onOpenSession={onOpenSession}
        onResumeSession={onResumeSession}
        onStopSession={onStopSession}
        session={session}
      />
    </div>
  );
}
