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
}

export function DialogTitleBlock({ eyebrow, level = 2, title }: DialogTitleBlockProps) {
  return (
    <ContentStack gap="xs">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading level={level}>{title}</Heading>
    </ContentStack>
  );
}

export function DialogActionsFooter({ children, bordered = false }: DialogActionsFooterProps) {
  return (
    <Box
      px="xl"
      py="md"
      style={
        bordered
          ? {
              borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
              width: '100%',
            }
          : { width: '100%' }
      }
    >
      <ActionRow gap="sm" justify="end">
        {children}
      </ActionRow>
    </Box>
  );
}
