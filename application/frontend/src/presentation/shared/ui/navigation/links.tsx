import { Anchor, Box, Group, type AnchorProps as MantineAnchorProps, NavLink, type NavLinkProps } from '@mantine/core';
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';
import { createLink } from '../../routing/router';
import {
  actionLinkStyles,
  externalMonoLinkStyle,
  inlineLinkStyle,
  navPillLinkStyle,
  uiThemeTokens,
} from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';
import { usePresentationMediaQuery } from '../layout/use-presentation-media-query';

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

type AnchorStyles = NonNullable<MantineAnchorProps['styles']>;

interface RoutedContentLinkProps extends LinkContentProps {
  readonly styles?: AnchorStyles;
  readonly to: string;
}

type RoutedAnchorBaseProps = Pick<ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & {
  readonly styles?: AnchorStyles;
};

const RoutedAnchor = createLink(Anchor as ComponentType<RoutedAnchorBaseProps>);
const RoutedSectionLink = createLink(
  NavLink as ComponentType<NavLinkProps & Pick<ComponentPropsWithoutRef<'a'>, 'href' | 'aria-current'>>,
);

const brandLinkStyles = {
  root: {
    alignItems: 'center',
    color: uiThemeTokens.color.text.emphasis,
    display: 'inline-flex',
    gap: uiThemeTokens.spacing.xs,
    textDecoration: 'none',
    userSelect: 'none',
  },
} as const satisfies AnchorStyles;

function LinkContent({ children, leftSection, rightSection }: LinkContentProps) {
  if (!leftSection && !rightSection) {
    return <>{children}</>;
  }

  return (
    <Group align="center" component="span" gap="xs" wrap="nowrap">
      {leftSection}
      <Box component="span">{children}</Box>
      {rightSection}
    </Group>
  );
}

function RoutedContentLink({ children, leftSection, rightSection, styles, to }: RoutedContentLinkProps) {
  return (
    <RoutedAnchor styles={styles} to={to}>
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
      styles={{ root: navPillLinkStyle }}
      to={to}
    >
      {children}
    </RoutedContentLink>
  );
}

export function SectionNavigationLink({
  active,
  children,
  leftSection,
  to,
}: BaseLinkProps & { readonly active: boolean }) {
  const isMobile = usePresentationMediaQuery();
  return (
    <RoutedSectionLink
      active={active}
      aria-current={active ? 'page' : undefined}
      label={children}
      leftSection={isMobile ? undefined : leftSection}
      px={{ base: 'xxs', sm: 'sm' }}
      py={{ base: 'xs', sm: 'sm' }}
      styles={{
        root: {
          borderRadius: uiThemeTokens.radius.field,
          '--nl-bg': uiThemeTokens.color.surface.accentMuted,
          '--nl-color': uiThemeTokens.color.text.emphasis,
          '--nl-hover': uiThemeTokens.color.surface.neutralMuted,
        },
        label: { whiteSpace: 'normal' },
      }}
      to={to}
    />
  );
}

export function PrimaryActionLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink
      leftSection={leftSection}
      rightSection={rightSection ?? <AppIcon name="arrow-right" size={16} />}
      styles={{ root: actionLinkStyles.primary }}
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
      styles={{ root: actionLinkStyles.secondary }}
      to={to}
    >
      {children}
    </RoutedContentLink>
  );
}

export function InlineTextLink({ children, leftSection, rightSection, to }: BaseLinkProps) {
  return (
    <RoutedContentLink leftSection={leftSection} rightSection={rightSection} styles={{ root: inlineLinkStyle }} to={to}>
      {children}
    </RoutedContentLink>
  );
}

type BrandLinkProps = BaseLinkProps;

interface ExternalTextLinkProps {
  readonly children?: ReactNode;
  readonly href: string;
  readonly target?: '_blank' | '_self';
}

export function BrandLink({ children, to }: BrandLinkProps) {
  return (
    <RoutedAnchor styles={brandLinkStyles} to={to}>
      {children}
    </RoutedAnchor>
  );
}

export function ExternalTextLink({ children, href, target = '_blank' }: ExternalTextLinkProps) {
  return (
    <Anchor
      href={href}
      rel={target === '_blank' ? 'noreferrer' : undefined}
      styles={{ root: externalMonoLinkStyle }}
      target={target}
    >
      {children}
    </Anchor>
  );
}
