import type { PropsWithChildren, ReactNode } from 'react';
import { surfaceRecipes } from '../ui/foundation/ui-recipes';
import { uiThemeTokens } from '../ui/foundation/ui-theme';
import { uiTypeScale } from '../ui/foundation/ui-typography';

const pageIntroRootStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.xl,
} as const;

const pageIntroEyebrowStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  textTransform: 'uppercase',
} as const;

const pageIntroTitleStyle = {
  ...uiTypeScale.pageTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const pageIntroSubtitleStyle = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  maxWidth: '48rem',
  margin: 0,
} as const;

const pageIntroRowStyle = {
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'nowrap',
  gap: uiThemeTokens.spacing.xl,
  justifyContent: 'space-between',
} as const;

const pageIntroTextGroupStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  minWidth: 0,
} as const;

const pageIntroActionsStyle = {
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'nowrap',
  gap: uiThemeTokens.spacing.sm,
} as const;

interface PageIntroProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly level?: 1 | 2;
}

export function PageIntro({ eyebrow, title, subtitle, actions, level = 1 }: PageIntroProps) {
  const HeadingTag = level === 1 ? 'h1' : 'h2';

  return (
    <header style={pageIntroRootStyle}>
      <div style={pageIntroRowStyle}>
        <div style={pageIntroTextGroupStyle}>
          {eyebrow ? <p style={pageIntroEyebrowStyle}>{eyebrow}</p> : null}
          <HeadingTag style={pageIntroTitleStyle}>{title}</HeadingTag>
          {subtitle ? <p style={pageIntroSubtitleStyle}>{subtitle}</p> : null}
        </div>
        {actions ? <div style={pageIntroActionsStyle}>{actions}</div> : null}
      </div>
    </header>
  );
}

const stickyActionBarStyle = {
  ...surfaceRecipes.elevated,
  borderRadius: 0,
  borderLeft: 'none',
  borderRight: 'none',
  bottom: 0,
  left: 0,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
  position: 'sticky',
  right: 0,
  zIndex: 100,
} as const;

const stickyActionBarRowStyle = {
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'flex-end',
} as const;

export function StickyActionBar({ children }: PropsWithChildren) {
  return (
    <div role="toolbar" style={stickyActionBarStyle}>
      <div style={stickyActionBarRowStyle}>{children}</div>
    </div>
  );
}

const stateContainerStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'center',
  minHeight: '12rem',
  padding: uiThemeTokens.spacing.xl,
  textAlign: 'center',
} as const;

const stateIconFrameStyle = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.neutralMuted,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: '50%',
  display: 'flex',
  height: '3.5rem',
  justifyContent: 'center',
  width: '3.5rem',
} as const;

const stateTitleStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const stateMessageStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '28rem',
} as const;

interface GlobalStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly message?: string;
  readonly actions?: ReactNode;
}

export function GlobalEmptyState({ icon, title, message, actions }: GlobalStateProps) {
  return (
    <div style={stateContainerStyle}>
      {icon ? <div style={stateIconFrameStyle}>{icon}</div> : null}
      <p style={stateTitleStyle}>{title}</p>
      {message ? <p style={stateMessageStyle}>{message}</p> : null}
      {actions ?? null}
    </div>
  );
}

export function GlobalErrorState({ icon, title, message, actions }: GlobalStateProps) {
  return (
    <div role="alert" style={stateContainerStyle}>
      {icon ? (
        <div style={{ ...stateIconFrameStyle, borderColor: uiThemeTokens.color.border.danger }}>
          {icon}
        </div>
      ) : null}
      <p style={{ ...stateTitleStyle, color: uiThemeTokens.color.text.danger }}>{title}</p>
      {message ? <p style={stateMessageStyle}>{message}</p> : null}
      {actions ?? null}
    </div>
  );
}
