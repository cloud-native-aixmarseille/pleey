import type { ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface CatalogItemCardProps {
  readonly title: string;
  readonly description?: string | null;
  readonly descriptionFallback?: string;
  readonly badge?: string;
  readonly badgeIcon?: ReactNode;
  readonly metadata?: readonly string[];
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
}

const rootStyle = {
  ...surfaceRecipes.inset,
  padding: uiThemeTokens.spacing.lg,
} as const;

const stackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
} as const;

const badgeStyle = {
  ...uiTypeScale.overline,
  alignItems: 'center',
  color: uiThemeTokens.color.brand.primary,
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xxs,
  textTransform: 'uppercase',
} as const;

const titleStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const descriptionStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
} as const;

const metadataStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
} as const;

export function CatalogItemCard({
  title,
  description,
  descriptionFallback,
  badge,
  badgeIcon,
  metadata,
  actions,
  children,
}: CatalogItemCardProps) {
  const displayDescription = description ?? descriptionFallback;

  return (
    <article style={rootStyle}>
      <div style={stackStyle}>
        {badge ? (
          <span style={badgeStyle}>
            {badgeIcon}
            {badge}
          </span>
        ) : null}
        <h3 style={titleStyle}>{title}</h3>
        {displayDescription ? <p style={descriptionStyle}>{displayDescription}</p> : null}
        {metadata?.map((item) => (
          <p key={item} style={metadataStyle}>
            {item}
          </p>
        ))}
        {children}
        {actions ? <div style={actionsStyle}>{actions}</div> : null}
      </div>
    </article>
  );
}
