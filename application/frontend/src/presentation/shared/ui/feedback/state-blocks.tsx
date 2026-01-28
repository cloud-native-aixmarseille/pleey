import { Group, Skeleton, Stack, Text } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';
import { SupportingText } from '../layout/typography';

const emptyRootStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  justifyContent: 'center',
  padding: uiThemeTokens.spacing.lg,
} as const;

const stateIconStyle = {
  color: uiThemeTokens.color.brand.primary,
  display: 'inline-flex',
} as const;

export function EmptyState({ children }: PropsWithChildren) {
  return (
    <div style={emptyRootStyle}>
      <span style={stateIconStyle}>
        <AppIcon name="empty" size={20} />
      </span>
      <SupportingText>{children}</SupportingText>
    </div>
  );
}

const loadingRootStyle = {
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  padding: uiThemeTokens.spacing.lg,
} as const;

const loadingMessageStyle = {
  color: uiThemeTokens.color.text.secondary,
} as const;

type LoadingStateVariant = 'list' | 'cards' | 'editor';

interface LoadingStateProps extends PropsWithChildren {
  readonly variant?: LoadingStateVariant;
}

const cardSkeletonStyle = {
  borderRadius: uiThemeTokens.radius.panel,
  overflow: 'hidden',
} as const;

function renderListSkeleton() {
  return (
    <Stack gap="sm">
      <Skeleton height={18} radius="xl" width="42%" />
      <Skeleton height={52} radius="xl" />
      <Skeleton height={52} radius="xl" />
      <Skeleton height={52} radius="xl" width="88%" />
    </Stack>
  );
}

function renderCardsSkeleton() {
  return (
    <>
      <Group gap="sm" wrap="wrap">
        <Skeleton height={40} radius="xl" width={220} />
        <Skeleton height={40} radius="xl" width={180} />
        <Skeleton height={40} radius="xl" width={120} />
      </Group>

      <Group align="stretch" gap="md" grow wrap="wrap">
        {[0, 1, 2].map((index) => (
          <Stack gap="sm" key={index} style={cardSkeletonStyle}>
            <Skeleton height={148} radius="xl" />
            <Skeleton height={18} radius="xl" width="68%" />
            <Skeleton height={14} radius="xl" width="92%" />
            <Skeleton height={14} radius="xl" width="78%" />
            <Group gap="xs">
              <Skeleton height={34} radius="xl" width={110} />
              <Skeleton height={34} radius="xl" width={96} />
            </Group>
          </Stack>
        ))}
      </Group>
    </>
  );
}

function renderEditorSkeleton() {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Skeleton height={10} radius="xl" width="18%" />
        <Skeleton height={34} radius="xl" width="40%" />
        <Skeleton height={16} radius="xl" width="62%" />
      </Stack>

      <Group gap="md" grow wrap="wrap">
        <Skeleton height={132} radius="xl" />
        <Skeleton height={132} radius="xl" />
      </Group>

      <Skeleton height={260} radius="xl" />
      <Skeleton height={220} radius="xl" />
    </Stack>
  );
}

function renderLoadingSkeleton(variant: LoadingStateVariant) {
  switch (variant) {
    case 'cards':
      return renderCardsSkeleton();
    case 'editor':
      return renderEditorSkeleton();
    case 'list':
    default:
      return renderListSkeleton();
  }
}

export function LoadingState({ children, variant = 'list' }: LoadingStateProps) {
  return (
    <output aria-busy="true" style={loadingRootStyle}>
      <Text size="sm" style={loadingMessageStyle}>
        {children}
      </Text>
      {renderLoadingSkeleton(variant)}
    </output>
  );
}

export function PendingState({ children }: PropsWithChildren) {
  return (
    <div style={emptyRootStyle}>
      <span style={stateIconStyle}>
        <AppIcon name="pending" size={20} />
      </span>
      <SupportingText>{children}</SupportingText>
    </div>
  );
}
