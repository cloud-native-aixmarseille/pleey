import type { CSSProperties } from 'react';
import { uiThemeTokens } from './ui-theme-tokens';

export function createFieldInputStyle(isInvalid: boolean, compact = false): CSSProperties {
  return {
    background: uiThemeTokens.color.surface.field,
    border: `1px solid ${
      isInvalid ? uiThemeTokens.color.border.danger : uiThemeTokens.color.border.subtle
    }`,
    borderRadius: uiThemeTokens.radius.field,
    color: uiThemeTokens.color.text.primary,
    outline: 'none',
    padding: compact ? '0.35rem 0.6rem' : '0.9rem 1rem',
    width: '100%',
  };
}

const overlineTextStyle = {
  color: uiThemeTokens.color.brand.primary,
  fontFamily: uiThemeTokens.typography.overlineFamily,
  fontSize: '0.55rem',
  letterSpacing: '0.35rem',
  textTransform: 'uppercase',
} satisfies CSSProperties;

export function createTextareaInputStyle(isInvalid: boolean): CSSProperties {
  return {
    ...createFieldInputStyle(isInvalid),
    minHeight: '7.5rem',
    resize: 'vertical',
  };
}

export function createEyebrowTextStyle({
  compact = false,
  tone = 'accent',
}: {
  readonly compact?: boolean;
  readonly tone?: 'accent' | 'success';
} = {}): CSSProperties {
  return {
    ...overlineTextStyle,
    color:
      tone === 'success' ? uiThemeTokens.color.brand.success : uiThemeTokens.color.brand.primary,
    letterSpacing: compact ? '0.32rem' : overlineTextStyle.letterSpacing,
  };
}

export function createHeadingStyle({
  fontSize,
  lineHeight,
}: {
  readonly fontSize: string;
  readonly lineHeight: number;
}): CSSProperties {
  return {
    color: uiThemeTokens.color.text.emphasis,
    fontSize,
    lineHeight,
  };
}

const basePillLinkStyle = {
  alignItems: 'center',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  display: 'inline-flex',
  fontWeight: 700,
  justifyContent: 'center',
  lineHeight: 1,
  padding: '0.9rem 1.2rem',
  textDecoration: 'none',
} satisfies CSSProperties;

export const navPillLinkStyle = {
  ...basePillLinkStyle,
  fontSize: '0.72rem',
  letterSpacing: '0.22rem',
  textTransform: 'uppercase',
} satisfies CSSProperties;

export const actionLinkStyles = {
  accent: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.strongAccent,
    borderColor: uiThemeTokens.color.border.strong,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
  primary: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.accentPanel,
    borderColor: uiThemeTokens.color.border.accent,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
  secondary: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.neutralMuted,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
} as const satisfies Record<'accent' | 'primary' | 'secondary', CSSProperties>;

export const inlineLinkStyle = {
  color: uiThemeTokens.color.brand.primary,
  fontSize: '0.95rem',
  fontWeight: 700,
  textDecoration: 'none',
} satisfies CSSProperties;

export const emphasizedSummaryTextStyle = {
  color: uiThemeTokens.color.text.emphasis,
  fontSize: '0.875rem',
  fontWeight: 600,
  margin: 0,
} satisfies CSSProperties;

export function createBadgeStyle(
  tone: 'accent' | 'success' | 'neutral' | 'info' | 'warning' | 'error' | 'live',
): CSSProperties {
  const toneMap = {
    accent: {
      background: uiThemeTokens.color.surface.accentPanel,
      borderColor: uiThemeTokens.color.border.accent,
      color: uiThemeTokens.color.text.status,
    },
    success: {
      background: uiThemeTokens.color.surface.recessed,
      borderColor: uiThemeTokens.color.border.success,
      color: uiThemeTokens.color.text.statusSoft,
    },
    neutral: {
      background: uiThemeTokens.color.surface.neutralMuted,
      borderColor: uiThemeTokens.color.border.subtle,
      color: uiThemeTokens.color.text.secondary,
    },
    info: {
      background: uiThemeTokens.color.surface.accentMuted,
      borderColor: uiThemeTokens.color.border.accent,
      color: uiThemeTokens.color.text.status,
    },
    warning: {
      background: uiThemeTokens.color.surface.warning,
      borderColor: uiThemeTokens.color.border.warning,
      color: uiThemeTokens.color.text.warning,
    },
    error: {
      background: uiThemeTokens.color.surface.danger,
      borderColor: uiThemeTokens.color.border.danger,
      color: uiThemeTokens.color.text.danger,
    },
    live: {
      background: uiThemeTokens.color.surface.live,
      borderColor: uiThemeTokens.color.border.live,
      color: uiThemeTokens.color.text.live,
    },
  } as const;

  const toneStyle = toneMap[tone];

  return {
    background: toneStyle.background,
    border: `1px solid ${toneMap[tone].borderColor}`,
    borderRadius: uiThemeTokens.radius.pill,
    color: toneStyle.color,
    display: 'inline-flex',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    lineHeight: 1,
    padding: '0.35rem 0.75rem',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

export const authLayoutRootStyle = {
  alignItems: 'center',
  background: [
    `radial-gradient(circle at top, ${uiThemeTokens.color.surface.accentMuted}, transparent 42%)`,
    `linear-gradient(180deg, ${uiThemeTokens.color.surface.canvas}, ${uiThemeTokens.color.surface.recessed})`,
  ].join(', '),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.md}`,
  position: 'relative',
} satisfies CSSProperties;

export const AUTH_LAYOUT_RESPONSIVE_CSS = `
  [data-patience-playground]:has([data-auth-layout]) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  [data-auth-shell] { width: min(100%, 30rem); }
  @media (min-width: 48em) {
    [data-auth-shell] { width: min(100%, 34rem); }
  }
`;

export const authLayoutBackdropStyle = {
  background: [
    `radial-gradient(circle at 18% 22%, ${uiThemeTokens.color.surface.strongAccent}, transparent 30%)`,
    `radial-gradient(circle at 78% 10%, ${uiThemeTokens.color.surface.accentPanel}, transparent 24%)`,
    `radial-gradient(circle at 50% 100%, ${uiThemeTokens.color.surface.accentMuted}, transparent 36%)`,
  ].join(', '),
  inset: 0,
  opacity: 0.72,
  position: 'absolute',
} satisfies CSSProperties;

export const authLayoutShellStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: 0,
  position: 'relative',
  width: '100%',
  zIndex: 1,
} satisfies CSSProperties;

export const authLayoutBrandingPanelStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
} satisfies CSSProperties;

export const authLayoutTaglineStyle = {
  color: uiThemeTokens.color.text.secondary,
  fontFamily: uiThemeTokens.typography.bodyFamily,
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  margin: 0,
  textAlign: 'center',
} satisfies CSSProperties;

export const authBrandingFeatureListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.md}`,
  justifyContent: 'center',
  listStyle: 'none',
  margin: 0,
  padding: 0,
} satisfies CSSProperties;

export const authBrandingFeatureItemStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.soft,
  display: 'flex',
  fontFamily: uiThemeTokens.typography.bodyFamily,
  fontSize: '0.8125rem',
  gap: uiThemeTokens.spacing.xs,
} satisfies CSSProperties;

export const authLayoutContentPanelStyle = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
} satisfies CSSProperties;

export const authFormCardStyle = {
  background: uiThemeTokens.color.surface.panel,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.elevated,
  maxWidth: '34rem',
  padding: uiThemeTokens.spacing.xl,
  width: '100%',
} satisfies CSSProperties;

export const authAvatarFrameStyle = {
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '50%',
  boxShadow: uiThemeTokens.shadow.accentGlow,
  height: '5rem',
  objectFit: 'cover',
  width: '5rem',
} satisfies CSSProperties;

export const authProfileIdentityStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
} satisfies CSSProperties;

export const authAccountActionsStyle = {
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.inset,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: uiThemeTokens.spacing.md,
} satisfies CSSProperties;
