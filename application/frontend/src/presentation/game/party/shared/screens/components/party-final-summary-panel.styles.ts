import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import type { PodiumRank } from './party-final-summary-panel.model';

export const heroContentStyle: CSSProperties = {
  margin: '0 auto',
  maxWidth: '40rem',
  textAlign: 'center',
};

export const mobileHeroContentStyle: CSSProperties = {
  margin: '0 auto',
  maxWidth: '22rem',
  textAlign: 'center',
};

export const heroIconStyle: CSSProperties = {
  color: uiThemeTokens.color.brand.accent,
  filter: `drop-shadow(0 0 18px ${uiThemeTokens.color.brand.accent})`,
  fontSize: '3.25rem',
  lineHeight: 1,
};

export const mobileHeroIconStyle: CSSProperties = {
  ...heroIconStyle,
  fontSize: '2.4rem',
};

export const heroTitleStyle: CSSProperties = {
  ...uiTypeScale.hero,
  background: `linear-gradient(135deg, ${uiThemeTokens.color.brand.accent}, ${uiThemeTokens.color.brand.primary})`,
  backgroundClip: 'text',
  color: 'transparent',
  margin: 0,
  WebkitBackgroundClip: 'text',
};

export const mobileHeroTitleStyle: CSSProperties = {
  ...heroTitleStyle,
  fontSize: '2.8rem',
  lineHeight: 0.95,
};

export const heroSubtitleStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '36rem',
};

export const mobileHeroSubtitleStyle: CSSProperties = {
  ...heroSubtitleStyle,
  fontSize: '1rem',
  maxWidth: '20rem',
};

export const podiumDesktopRackStyle: CSSProperties = {
  alignItems: 'flex-end',
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  margin: '0 auto',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  maxWidth: '40rem',
  width: '100%',
};

export const podiumMobileListStyle: CSSProperties = {
  display: 'grid',
  gap: uiThemeTokens.spacing.sm,
  margin: '0 auto',
  maxWidth: '28rem',
  width: '100%',
};

export const podiumMobileSecondaryListStyle: CSSProperties = {
  display: 'grid',
  gap: uiThemeTokens.spacing.sm,
  width: '100%',
};

export const podiumSectionStyle: CSSProperties = {
  margin: '0 auto',
  maxWidth: '42rem',
  width: '100%',
};

export const podiumHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  textAlign: 'center',
};

export const mobileWinnerCardStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.leaderboard.podium.first.columnBackground,
  border: uiThemeTokens.leaderboard.podium.first.columnBorder,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.leaderboard.podium.first.columnShadow,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: `${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.md}`,
  textAlign: 'center',
  width: '100%',
};

export const mobileWinnerHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
  justifyContent: 'center',
};

export const mobileWinnerNameStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

const podiumColumnBaseStyle: CSSProperties = {
  alignItems: 'center',
  borderRadius: `${uiThemeTokens.radius.panel} ${uiThemeTokens.radius.panel} 0 0`,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'flex-start',
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
  position: 'relative',
  textAlign: 'center',
  width: '100%',
};

export function buildPodiumColumnStyle(rank: PodiumRank): CSSProperties {
  if (rank === 1) {
    return {
      ...podiumColumnBaseStyle,
      background: uiThemeTokens.leaderboard.podium.first.columnBackground,
      border: uiThemeTokens.leaderboard.podium.first.columnBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.first.columnShadow,
      minHeight: '17rem',
      padding: `${uiThemeTokens.spacing.xxl} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.xl}`,
    };
  }

  if (rank === 2) {
    return {
      ...podiumColumnBaseStyle,
      background: uiThemeTokens.leaderboard.podium.second.columnBackground,
      border: uiThemeTokens.leaderboard.podium.second.columnBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.second.columnShadow,
      minHeight: '13rem',
      padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.xl}`,
    };
  }

  return {
    ...podiumColumnBaseStyle,
    background: uiThemeTokens.leaderboard.podium.third.columnBackground,
    border: uiThemeTokens.leaderboard.podium.third.columnBorder,
    boxShadow: uiThemeTokens.leaderboard.podium.third.columnShadow,
    minHeight: '10rem',
    padding: `${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
  };
}

export function buildPodiumBadgeStyle(rank: PodiumRank): CSSProperties {
  const palette =
    rank === 1
      ? uiThemeTokens.leaderboard.podium.first
      : rank === 2
        ? uiThemeTokens.leaderboard.podium.second
        : uiThemeTokens.leaderboard.podium.third;

  return {
    alignItems: 'center',
    background: palette.badgeBackground,
    borderRadius: uiThemeTokens.radius.pill,
    boxShadow: palette.badgeShadow,
    color: palette.badgeText,
    display: 'flex',
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: rank === 1 ? '1.5rem' : '1.15rem',
    fontWeight: 800,
    height: rank === 1 ? '3.25rem' : '2.6rem',
    justifyContent: 'center',
    width: rank === 1 ? '3.25rem' : '2.6rem',
  };
}

export function buildPodiumAvatarStyle(rank: PodiumRank): CSSProperties {
  if (rank === 1) {
    return {
      border: uiThemeTokens.leaderboard.podium.first.avatarBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.first.avatarShadow,
    };
  }

  if (rank === 2) {
    return {
      border: uiThemeTokens.leaderboard.podium.second.avatarBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.second.avatarShadow,
    };
  }

  return {
    border: uiThemeTokens.leaderboard.podium.third.avatarBorder,
    boxShadow: uiThemeTokens.leaderboard.podium.third.avatarShadow,
  };
}

export const podiumUsernameStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const podiumPointsStyle: CSSProperties = {
  ...uiTypeScale.metric,
  color: uiThemeTokens.color.brand.accent,
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  textShadow: `0 0 16px ${uiThemeTokens.color.brand.accent}, ${uiThemeTokens.leaderboard.podium.pointsTextShadowTail}`,
};

export const podiumCurrentPlayerSlotStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '1.75rem',
};

export const mobileWinnerScoreStyle: CSSProperties = {
  ...podiumPointsStyle,
  fontSize: '2rem',
};

export const podiumCrownStyle: CSSProperties = {
  filter: uiThemeTokens.leaderboard.podium.first.crownFilter,
  fontSize: '1.75rem',
  lineHeight: 1,
};

const podiumMobileCardBaseStyle: CSSProperties = {
  alignItems: 'stretch',
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.md}`,
  width: '100%',
};

export const podiumMobileCardHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'space-between',
};

export const podiumMobileIdentityStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
  minWidth: 0,
};

export const podiumMobileNameGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  minWidth: 0,
};

export const podiumMobileRankGroupStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  gap: uiThemeTokens.spacing.xs,
};

export const podiumMobileScoreStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.brand.accent,
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  textAlign: 'right',
};

export function buildPodiumMobileCardStyle(rank: PodiumRank): CSSProperties {
  if (rank === 1) {
    return {
      ...podiumMobileCardBaseStyle,
      background: uiThemeTokens.leaderboard.podium.first.columnBackground,
      border: uiThemeTokens.leaderboard.podium.first.columnBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.first.columnShadow,
    };
  }

  if (rank === 2) {
    return {
      ...podiumMobileCardBaseStyle,
      background: uiThemeTokens.leaderboard.podium.second.columnBackground,
      border: uiThemeTokens.leaderboard.podium.second.columnBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.second.columnShadow,
    };
  }

  return {
    ...podiumMobileCardBaseStyle,
    background: uiThemeTokens.leaderboard.podium.third.columnBackground,
    border: uiThemeTokens.leaderboard.podium.third.columnBorder,
    boxShadow: uiThemeTokens.leaderboard.podium.third.columnShadow,
  };
}

export const standingsListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

export const standingsRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.md,
  width: '100%',
};

export const standingsRankStyle: CSSProperties = {
  ...uiTypeScale.label,
  color: uiThemeTokens.color.text.soft,
  flexShrink: 0,
  minWidth: '2.25rem',
  textAlign: 'right',
};

export const standingsBodyStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  gap: uiThemeTokens.spacing.md,
  minWidth: 0,
};

export const standingsUsernameStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const mobileStandingsRowStyle: CSSProperties = {
  display: 'grid',
  gap: uiThemeTokens.spacing.sm,
  width: '100%',
};

export const mobileStandingsTopStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  gap: uiThemeTokens.spacing.sm,
};

export const mobileStandingsIdentityStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
};

export const mobileStandingsNameGroupStyle: CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  minWidth: 0,
};
