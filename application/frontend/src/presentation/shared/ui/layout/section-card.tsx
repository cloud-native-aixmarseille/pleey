import { Stack } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { useId } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface SectionCardProps extends PropsWithChildren {
  readonly actions?: ReactNode;
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly footer?: ReactNode;
  readonly icon?: ReactNode;
}

const rootStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.xl,
} as const;

const eyebrowStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const titleStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const headerStyle = {
  alignItems: 'flex-start',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
} as const;

const headerRowStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'space-between',
} as const;

const headerActionsStyle = {
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  gap: uiThemeTokens.spacing.sm,
} as const;

const headerIconStyle = {
  color: uiThemeTokens.color.brand.primary,
  display: 'inline-flex',
  marginTop: '0.15rem',
} as const;

const descriptionStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.secondary,
  margin: `${uiThemeTokens.spacing.xs} 0 0`,
} as const;

const footerStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
} as const;

export function SectionCard({
  actions,
  children,
  eyebrow,
  title,
  description,
  footer,
  icon,
}: SectionCardProps) {
  const titleId = useId();

  return (
    <section style={rootStyle} aria-labelledby={titleId}>
      <Stack gap="md">
        {eyebrow ? <p style={eyebrowStyle}>{eyebrow}</p> : null}
        <div style={headerRowStyle}>
          <div style={headerStyle}>
            {icon ? <span style={headerIconStyle}>{icon}</span> : null}
            <div>
              <h2 id={titleId} style={titleStyle}>
                {title}
              </h2>
              {description ? <p style={descriptionStyle}>{description}</p> : null}
            </div>
          </div>
          {actions ? <div style={headerActionsStyle}>{actions}</div> : null}
        </div>
        <div>{children}</div>
        {footer ? <p style={footerStyle}>{footer}</p> : null}
      </Stack>
    </section>
  );
}
