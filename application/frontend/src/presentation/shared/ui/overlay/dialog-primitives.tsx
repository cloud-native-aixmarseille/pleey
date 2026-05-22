import { Box } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ActionRow, ContentStack } from '../layout/containers';
import { Eyebrow, Heading } from '../layout/typography';

interface DialogTitleBlockProps {
  readonly eyebrow?: string;
  readonly level?: 1 | 2 | 3;
  readonly title: string;
}

interface DialogActionsFooterProps extends PropsWithChildren {
  readonly bordered?: boolean;
  readonly stacked?: boolean;
}

export function DialogTitleBlock({ eyebrow, level = 2, title }: DialogTitleBlockProps) {
  return (
    <ContentStack gap="xs">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading level={level}>{title}</Heading>
    </ContentStack>
  );
}

export function DialogActionsFooter({
  children,
  bordered = false,
  stacked = false,
}: DialogActionsFooterProps) {
  const baseStyle = bordered
    ? {
        borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
        width: '100%',
      }
    : { width: '100%' };

  return (
    <Box
      px={stacked ? 'md' : 'xl'}
      py={stacked ? 'sm' : 'md'}
      style={
        stacked
          ? {
              ...baseStyle,
              paddingBottom: `calc(${uiThemeTokens.spacing.md} + env(safe-area-inset-bottom, 0px))`,
            }
          : baseStyle
      }
    >
      {stacked ? (
        <ContentStack gap="sm">{children}</ContentStack>
      ) : (
        <ActionRow gap="sm" justify="end">
          {children}
        </ActionRow>
      )}
    </Box>
  );
}
