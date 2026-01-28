import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';

/* ── Hero header ─────────────────────────────────────────────── */

export const heroRootStyle: CSSProperties = {
  alignItems: 'center',
  background: `radial-gradient(ellipse at 50% 0%, ${uiThemeTokens.color.surface.accentPanel} 0%, ${uiThemeTokens.color.surface.canvas} 70%)`,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xxl} ${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.lg}`,
  position: 'relative',
  textAlign: 'center',
};

export const heroTrophyStyle: CSSProperties = {
  color: uiThemeTokens.color.brand.accent,
  filter: `drop-shadow(0 0 18px ${uiThemeTokens.color.brand.accent})`,
  fontSize: '3.5rem',
  lineHeight: 1,
};

export const heroTitleStyle: CSSProperties = {
  ...uiTypeScale.hero,
  background: `linear-gradient(135deg, ${uiThemeTokens.color.brand.accent}, ${uiThemeTokens.color.brand.primary})`,
  backgroundClip: 'text',
  color: 'transparent',
  margin: 0,
  WebkitBackgroundClip: 'text',
};

export const heroSubtitleStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '36rem',
};

/* ── Confetti / decorative particles (CSS keyframes) ─────────── */

export const LEADERBOARD_KEYFRAMES_CSS = `
  @keyframes lb-confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(calc(100vh + 20px)) rotate(720deg); opacity: 0; }
  }
  @keyframes lb-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes lb-glow-pulse {
    0%, 100% { opacity: 0.4; }
    50%      { opacity: 0.8; }
  }
  @keyframes lb-points-count {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
`;

/* ── Podium layout (classic 2nd | 1st | 3rd) ─────────────────── */

export const podiumGridStyle: CSSProperties = {
  alignItems: 'flex-end',
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  gridTemplateColumns: '1fr 1.2fr 1fr',
  maxWidth: '44rem',
  padding: `${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.md} 0`,
  width: '100%',
};

const podiumColumnBase: CSSProperties = {
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
};

const podiumFirstStyle: CSSProperties = {
  ...podiumColumnBase,
  background: uiThemeTokens.leaderboard.podium.first.columnBackground,
  border: uiThemeTokens.leaderboard.podium.first.columnBorder,
  boxShadow: uiThemeTokens.leaderboard.podium.first.columnShadow,
  minHeight: '22rem',
};

const podiumSecondStyle: CSSProperties = {
  ...podiumColumnBase,
  background: uiThemeTokens.leaderboard.podium.second.columnBackground,
  border: uiThemeTokens.leaderboard.podium.second.columnBorder,
  boxShadow: uiThemeTokens.leaderboard.podium.second.columnShadow,
  minHeight: '16rem',
};

const podiumThirdStyle: CSSProperties = {
  ...podiumColumnBase,
  background: uiThemeTokens.leaderboard.podium.third.columnBackground,
  border: uiThemeTokens.leaderboard.podium.third.columnBorder,
  boxShadow: uiThemeTokens.leaderboard.podium.third.columnShadow,
  minHeight: '13rem',
};

export function getPodiumColumnStyle(rank: 1 | 2 | 3): CSSProperties {
  if (rank === 1) return podiumFirstStyle;
  if (rank === 2) return podiumSecondStyle;
  return podiumThirdStyle;
}

export const podiumRankBadgeStyle = (rank: 1 | 2 | 3): CSSProperties => {
  const colors = {
    1: {
      bg: uiThemeTokens.leaderboard.podium.first.badgeBackground,
      shadow: uiThemeTokens.leaderboard.podium.first.badgeShadow,
      text: uiThemeTokens.leaderboard.podium.first.badgeText,
    },
    2: {
      bg: uiThemeTokens.leaderboard.podium.second.badgeBackground,
      shadow: uiThemeTokens.leaderboard.podium.second.badgeShadow,
      text: uiThemeTokens.leaderboard.podium.second.badgeText,
    },
    3: {
      bg: uiThemeTokens.leaderboard.podium.third.badgeBackground,
      shadow: uiThemeTokens.leaderboard.podium.third.badgeShadow,
      text: uiThemeTokens.leaderboard.podium.third.badgeText,
    },
  } as const;
  const c = colors[rank];
  return {
    alignItems: 'center',
    background: c.bg,
    borderRadius: uiThemeTokens.radius.pill,
    boxShadow: c.shadow,
    color: c.text,
    display: 'flex',
    fontFamily: uiThemeTokens.typography.displayFamily,
    fontSize: rank === 1 ? '1.5rem' : '1.15rem',
    fontWeight: 800,
    height: rank === 1 ? '3.5rem' : '2.8rem',
    justifyContent: 'center',
    width: rank === 1 ? '3.5rem' : '2.8rem',
  };
};

export const podiumUsernameStyle = (rank: 1 | 2 | 3): CSSProperties => ({
  ...(rank === 1 ? uiTypeScale.sectionTitle : uiTypeScale.cardTitle),
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textShadow: rank === 1 ? uiThemeTokens.leaderboard.podium.first.usernameShadow : 'none',
  whiteSpace: 'nowrap',
});

export const podiumAvatarStyle = (rank: 1 | 2 | 3): CSSProperties => {
  const rings = {
    1: {
      border: uiThemeTokens.leaderboard.podium.first.avatarBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.first.avatarShadow,
    },
    2: {
      border: uiThemeTokens.leaderboard.podium.second.avatarBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.second.avatarShadow,
    },
    3: {
      border: uiThemeTokens.leaderboard.podium.third.avatarBorder,
      boxShadow: uiThemeTokens.leaderboard.podium.third.avatarShadow,
    },
  } as const;
  return rings[rank];
};

export const podiumPointsStyle: CSSProperties = {
  ...uiTypeScale.metric,
  color: uiThemeTokens.color.brand.accent,
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  textShadow: `0 0 16px ${uiThemeTokens.color.brand.accent}, ${uiThemeTokens.leaderboard.podium.pointsTextShadowTail}`,
};

export const podiumPointsLabelStyle: CSSProperties = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  textTransform: 'uppercase',
};

export const podiumCrownStyle: CSSProperties = {
  filter: uiThemeTokens.leaderboard.podium.first.crownFilter,
  fontSize: '2rem',
  lineHeight: 1,
};

/* ── Current player highlight ─────────────────────────────────── */

export const currentPlayerBarStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentPanel,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.accentGlow,
  display: 'flex',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'center',
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.lg}`,
};

export const currentPlayerTextStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

/* ── Remaining rankings ──────────────────────────────────────── */

export const rankingsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
};

export const rankingRowStyle = (isCurrentPlayer: boolean): CSSProperties => ({
  alignItems: 'center',
  background: isCurrentPlayer
    ? uiThemeTokens.color.surface.accentPanel
    : uiThemeTokens.color.surface.panel,
  border: `1px solid ${isCurrentPlayer ? uiThemeTokens.color.border.accent : uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.field,
  boxShadow: isCurrentPlayer ? uiThemeTokens.shadow.accentGlow : 'none',
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  gridTemplateColumns: '2.5rem 1fr auto',
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
  transition: `background ${uiThemeTokens.motion.standard}, border-color ${uiThemeTokens.motion.standard}`,
});

export const rankingPositionStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.soft,
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  textAlign: 'center',
};

export const rankingNameGroupStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
};

export const rankingAvatarStyle: CSSProperties = {
  border: `2px solid ${uiThemeTokens.color.border.subtle}`,
  flexShrink: 0,
};

export const rankingNameStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.primary,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const rankingPointsStyle: CSSProperties = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  fontVariantNumeric: 'tabular-nums',
  margin: 0,
  textAlign: 'right',
  whiteSpace: 'nowrap',
};
