import type { DashboardGameListItem } from '../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../shared/ui/layout/section-card';
import { Heading, SupportingText } from '../../../../shared/ui/layout/typography';

interface PredictionManagementMetadataSectionProps {
  readonly createdAtText: string;
  readonly description: string;
  readonly fallbackDescription: string;
  readonly game: DashboardGameListItem;
  readonly title: string;
}

export function PredictionManagementMetadataSection({
  createdAtText,
  description,
  fallbackDescription,
  game,
  title,
}: PredictionManagementMetadataSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      <ContentStack gap="sm">
        <Heading level={3}>{game.title}</Heading>
        <SupportingText>{game.description ?? fallbackDescription}</SupportingText>
        <SupportingText tone="soft">{createdAtText}</SupportingText>
      </ContentStack>
    </SectionCard>
  );
}
