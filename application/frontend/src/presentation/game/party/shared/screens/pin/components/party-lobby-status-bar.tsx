import type { ReactNode } from 'react';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';

interface PartyLobbyStatusBarProps {
  readonly ariaLabel: string;
  readonly metadataBadges?: readonly string[];
  readonly playerCountLabel: string;
  readonly statusLabel: string;
  readonly title: string;
  readonly trailing?: ReactNode;
  readonly supportingText: string | null;
}

export function PartyLobbyStatusBar({
  ariaLabel,
  metadataBadges = [],
  playerCountLabel,
  statusLabel,
  title,
  trailing,
  supportingText,
}: PartyLobbyStatusBarProps) {
  return (
    <header aria-label={ariaLabel} role="banner">
      <ElevatedPanel padding="md">
        <SplitWrapRow align="start" gap="md">
          <ContentStack gap="xs">
            <WrapRow gap="sm">
              <AppIcon name="game" size={20} />
              <Heading level={1}>{title}</Heading>
            </WrapRow>

            <WrapRow gap="xs">
              <Badge icon={<AppIcon name="play" size={12} />} tone="info">
                {statusLabel}
              </Badge>
              <Badge icon={<AppIcon name="profile" size={12} />} tone="neutral">
                {playerCountLabel}
              </Badge>
              {metadataBadges.map((badgeLabel) => (
                <Badge icon={<AppIcon name="profile" size={12} />} key={badgeLabel} tone="neutral">
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
