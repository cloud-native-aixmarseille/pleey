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
  const paddingBottom = stacked
    ? `calc(${uiThemeTokens.spacing.md} + env(safe-area-inset-bottom, 0px))`
    : undefined;

  return (
    <Box
      bd={bordered ? `1px solid ${uiThemeTokens.color.border.subtle}` : undefined}
      bdrs={0}
      px={stacked ? 'md' : 'xl'}
      py={stacked ? 'sm' : 'md'}
      pb={paddingBottom}
      style={bordered ? { borderTop: `1px solid ${uiThemeTokens.color.border.subtle}` } : undefined}
      w="100%"
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
