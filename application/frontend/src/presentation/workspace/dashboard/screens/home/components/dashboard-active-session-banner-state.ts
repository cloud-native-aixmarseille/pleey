import type { TranslationVariables } from '../../../../../../application/shared/contracts/translation.port';
import type { DashboardGameListItem } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import type { DashboardActiveSessionItem } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionParticipantRole } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../../../domains/game-session/entities/game-session-status';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import type { AppIconName } from '../../../../../shared/ui/icons/app-icon';

function getStatusTone(status: string): 'accent' | 'success' | 'neutral' | 'info' {
  if (status === GameSessionStatus.ACTIVE) {
    return 'success';
  }

  if (status === GameSessionStatus.PAUSED) {
    return 'info';
  }

  return 'neutral';
}

function getStatusLabelKey(status: string): string {
  if (status === GameSessionStatus.ACTIVE) {
    return 'dashboard.sessions.status.active';
  }

  if (status === GameSessionStatus.PAUSED) {
    return 'dashboard.sessions.status.paused';
  }

  return 'dashboard.sessions.status.waiting';
}

function getRoleLabelKey(session: DashboardActiveSessionItem): string | null {
  return session.participantRole === GameSessionParticipantRole.PLAYER
    ? 'dashboard.sessions.role.player'
    : null;
}

function getBannerChrome(status: string) {
  if (status === GameSessionStatus.ACTIVE) {
    return surfaceRecipes.live;
  }

  return {
    ...surfaceRecipes.elevated,
    border: `1px solid ${uiThemeTokens.color.border.info}`,
  };
}

interface DashboardActiveSessionBannerStateArgs {
  readonly gameTypeDescriptor: GameTypeDescriptor | undefined;
  readonly session: DashboardActiveSessionItem;
  readonly sessionGame: DashboardGameListItem | null;
  readonly t: (key: string, options?: TranslationVariables) => string;
}

export function resolveDashboardActiveSessionBannerState({
  gameTypeDescriptor,
  session,
  sessionGame,
  t,
}: DashboardActiveSessionBannerStateArgs) {
  return {
    bannerStyle: getBannerChrome(session.status),
    iconName: (gameTypeDescriptor?.iconKey as AppIconName | undefined) ?? 'game',
    roleLabel: getRoleLabelKey(session) ? t(getRoleLabelKey(session) as string) : null,
    statusLabel: t(getStatusLabelKey(session.status)),
    statusTone: getStatusTone(session.status),
    title: sessionGame?.title ?? t('dashboard.sessions.fallbackTitle', { pin: session.pin }),
    typeLabel: gameTypeDescriptor ? t(gameTypeDescriptor.titleKey) : null,
  };
}
