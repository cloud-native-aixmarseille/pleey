import { Anchor } from '@mantine/core';
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';
import { createLink } from '../../routing/router';
import {
  actionLinkStyles,
  inlineLinkStyle,
  navPillLinkStyle,
  uiThemeTokens,
} from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';

interface BaseLinkProps {
  readonly to: string;
  readonly children?: ReactNode;
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
}

type RoutedAnchorBaseProps = Pick<ComponentPropsWithoutRef<'a'>, 'children' | 'href' | 'style'>;

const RoutedAnchor = createLink(Anchor as ComponentType<RoutedAnchorBaseProps>);

const linkContentStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

function renderLinkContent(children: ReactNode, leftSection?: ReactNode, rightSection?: ReactNode) {
  if (!leftSection && !rightSection) {
    return children;
  }

  return (
    <span style={linkContentStyle}>
      {leftSection}
      <span>{children}</span>
      {rightSection}
    </span>
  );
}

export function NavPillLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedAnchor style={navPillLinkStyle} to={to}>
      {renderLinkContent(children, leftSection, rightSection)}
    </RoutedAnchor>
  );
}

export function PrimaryActionLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedAnchor style={actionLinkStyles.primary} to={to}>
      {renderLinkContent(
        children,
        leftSection,
        rightSection ?? <AppIcon name="arrow-right" size={16} />,
      )}
    </RoutedAnchor>
  );
}

export function SecondaryActionLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedAnchor style={actionLinkStyles.secondary} to={to}>
      {renderLinkContent(
        children,
        leftSection,
        rightSection ?? <AppIcon name="arrow-right" size={16} />,
      )}
    </RoutedAnchor>
  );
}

export function InlineTextLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedAnchor style={inlineLinkStyle} to={to}>
      {renderLinkContent(children, leftSection, rightSection)}
    </RoutedAnchor>
  );
}

interface BrandLinkProps extends BaseLinkProps {
  readonly style?: React.CSSProperties;
}

export function BrandLink({ children, style, to }: BrandLinkProps) {
  return (
    <RoutedAnchor style={style} to={to}>
      {children}
    </RoutedAnchor>
  );
}
