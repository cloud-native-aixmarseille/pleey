import { managementConsoleRecipes } from '../foundation/ui-recipes';
import type { AppIconName } from '../icons/app-icon';
import { AppIcon } from '../icons/app-icon';
import { ActionRow, ContentStack, ResponsiveGrid } from '../layout/containers';
import { InsetPanel } from '../layout/panels';
import { SummaryText, SupportingText } from '../layout/typography';

interface ManagementCommand {
  readonly id: string;
  readonly icon: AppIconName;
  readonly title: string;
  readonly description: string;
  readonly meta?: string;
}

interface ManagementCommandDeckProps {
  readonly commands: readonly ManagementCommand[];
}

export function ManagementCommandDeck({ commands }: ManagementCommandDeckProps) {
  return (
    <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="md">
      {commands.map((command) => (
        <InsetPanel key={command.id} padding="md">
          <div style={managementConsoleRecipes.commandCard}>
            <ContentStack gap="xs">
              <ActionRow gap="sm">
                <AppIcon name={command.icon} size={16} />
                <SummaryText>{command.title}</SummaryText>
              </ActionRow>
              <SupportingText>{command.description}</SupportingText>
              {command.meta ? <SupportingText tone="soft">{command.meta}</SupportingText> : null}
            </ContentStack>
          </div>
        </InsetPanel>
      ))}
    </ResponsiveGrid>
  );
}
