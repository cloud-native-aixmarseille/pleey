import type { ReactNode } from 'react';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';

interface PlayerLobbyStatusBarProps {
  readonly ariaLabel: string;
  readonly compact?: boolean;
  readonly metadataBadges?: readonly string[];
  readonly playerCountLabel: string;
  readonly statusLabel: string;
  readonly title: string;
  readonly trailing?: ReactNode;
  readonly supportingText: string | null;
}

export function PlayerLobbyStatusBar({
  ariaLabel,
  compact = false,
  metadataBadges = [],
  playerCountLabel,
  statusLabel,
  title,
  trailing,
  supportingText,
}: PlayerLobbyStatusBarProps) {
  return (
    <header aria-label={ariaLabel}>
      <ElevatedPanel padding="md">
        <SplitWrapRow align="start" gap="md">
          <ContentStack gap="xs">
            {compact ? null : (
              <WrapRow gap="sm">
                <AppIcon name="game" size={20} />
                <Heading level={1}>{title}</Heading>
              </WrapRow>
            )}

            <WrapRow gap="xs">
              <Badge icon={<AppIcon name="play" size={12} />} tone="info">
                {statusLabel}
              </Badge>
              <Badge icon={<AppIcon name="profile" size={12} />} tone="neutral">
                {playerCountLabel}
              </Badge>
              {compact
                ? null
                : metadataBadges.map((badgeLabel) => (
                    <Badge
                      icon={<AppIcon name="profile" size={12} />}
                      key={badgeLabel}
                      tone="neutral"
                    >
                      {badgeLabel}
                    </Badge>
                  ))}
            </WrapRow>

            {supportingText ? <SupportingText tone="soft">{supportingText}</SupportingText> : null}
          </ContentStack>

          {trailing ? <WrapRow gap="sm">{trailing}</WrapRow> : null}
        </SplitWrapRow>
      </ElevatedPanel>
    </header>
  );
}
