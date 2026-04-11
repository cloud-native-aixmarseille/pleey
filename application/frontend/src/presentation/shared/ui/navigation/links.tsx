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

interface LinkContentProps {
  readonly children?: ReactNode;
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
}

interface RoutedContentLinkProps extends LinkContentProps {
  readonly style?: React.CSSProperties;
  readonly to: string;
}

type RoutedAnchorBaseProps = Pick<ComponentPropsWithoutRef<'a'>, 'children' | 'href' | 'style'>;

const RoutedAnchor = createLink(Anchor as ComponentType<RoutedAnchorBaseProps>);

const linkContentStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

function LinkContent({ children, leftSection, rightSection }: LinkContentProps) {
  if (!leftSection && !rightSection) {
    return <>{children}</>;
  }

  return (
    <span style={linkContentStyle}>
      {leftSection}
      <span>{children}</span>
      {rightSection}
    </span>
  );
}

function RoutedContentLink({
  children,
  leftSection,
  rightSection,
  style,
  to,
}: RoutedContentLinkProps) {
  return (
    <RoutedAnchor style={style} to={to}>
      <LinkContent leftSection={leftSection} rightSection={rightSection}>
        {children}
      </LinkContent>
    </RoutedAnchor>
  );
}

export function NavPillLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink
      leftSection={leftSection}
      rightSection={rightSection}
      style={navPillLinkStyle}
      to={to}
    >
      {children}
    </RoutedContentLink>
  );
}

export function PrimaryActionLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink
      leftSection={leftSection}
      rightSection={rightSection ?? <AppIcon name="arrow-right" size={16} />}
      style={actionLinkStyles.primary}
      to={to}
    >
      {children}
    </RoutedContentLink>
  );
}

export function SecondaryActionLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink
      leftSection={leftSection}
      rightSection={rightSection ?? <AppIcon name="arrow-right" size={16} />}
      style={actionLinkStyles.secondary}
      to={to}
    >
      {children}
    </RoutedContentLink>
  );
}

export function InlineTextLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink
      leftSection={leftSection}
      rightSection={rightSection}
      style={inlineLinkStyle}
      to={to}
    >
      {children}
    </RoutedContentLink>
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
