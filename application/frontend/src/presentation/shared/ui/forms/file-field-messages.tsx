import { Text } from '@mantine/core';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ContentStack } from '../layout/containers';

interface FileFieldMessagesProps {
  readonly error?: string;
  readonly errorId?: string;
  readonly helpId: string;
  readonly helpText: string;
}

export function FileFieldMessages({ error, errorId, helpId, helpText }: FileFieldMessagesProps) {
  return (
    <ContentStack gap="xs">
      <Text c={uiThemeTokens.color.text.quiet} id={helpId} size="sm">
        {helpText}
      </Text>
      {error ? (
        <Text c={uiThemeTokens.color.text.danger} id={errorId} role="alert" size="sm">
          {error}
        </Text>
      ) : null}
    </ContentStack>
  );
}
