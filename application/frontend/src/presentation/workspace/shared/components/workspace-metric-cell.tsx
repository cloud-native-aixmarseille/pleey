import { ContentStack } from '../../../shared/ui/layout/containers';
import { SummaryText, SupportingText } from '../../../shared/ui/layout/typography';

interface WorkspaceMetricCellProps {
  readonly label: string;
  readonly value: number;
}

export function WorkspaceMetricCell({ label, value }: WorkspaceMetricCellProps) {
  return (
    <ContentStack align="center" gap="xs">
      <SummaryText>{String(value)}</SummaryText>
      <SupportingText>{label}</SupportingText>
    </ContentStack>
  );
}
