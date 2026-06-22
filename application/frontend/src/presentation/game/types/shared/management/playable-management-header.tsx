import { useState } from 'react';
import type { PlayableManagementState } from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { MenuActionButton } from '../../../../shared/ui/actions/menu-action-button';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, SplitWrapRow } from '../../../../shared/ui/layout/containers';
import { Eyebrow, Heading, SupportingText } from '../../../../shared/ui/layout/typography';
import { ManualMenuPanel, ManualMenuWrapper } from '../../../../shared/ui/overlay/manual-menu';

interface PlayableManagementHeaderProps {
  readonly state: PlayableManagementState;
  readonly translationRoot: string;
  readonly saveStateLabel: string;
  readonly onBack: () => void;
  readonly onDeleteGame: () => void;
  readonly onEditGame: () => void;
}

export function PlayableManagementHeader({
  onBack,
  onDeleteGame,
  onEditGame,
  saveStateLabel,
  state,
  translationRoot,
}: PlayableManagementHeaderProps) {
  const { t } = usePresentationTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SplitWrapRow align="start">
      <ContentStack gap="xs">
        <Eyebrow compact>{t(`${translationRoot}.eyebrow`)}</Eyebrow>
        <Heading level={1}>{state.game.title}</Heading>
        <SupportingText>
          {t(`${translationRoot}.statusLine`, { saveState: saveStateLabel })}
        </SupportingText>
      </ContentStack>
      <ActionRow justify="end">
        <Button
          intent="ghost"
          leftSection={<AppIcon name="arrow-left" size={14} />}
          onClick={onBack}
        >
          {t(`${translationRoot}.back`)}
        </Button>
        <ManualMenuWrapper>
          <Button
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            intent="ghost"
            leftSection={<AppIcon name="dots" size={14} />}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            {t(`${translationRoot}.moreActions`)}
          </Button>
          {isMenuOpen ? (
            <ManualMenuPanel>
              <MenuActionButton
                onClick={() => {
                  setIsMenuOpen(false);
                  onEditGame();
                }}
                role="menuitem"
              >
                {t(`${translationRoot}.editGame`)}
              </MenuActionButton>
              <MenuActionButton
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteGame();
                }}
                role="menuitem"
                tone="danger"
              >
                {t(`${translationRoot}.deleteGame`)}
              </MenuActionButton>
            </ManualMenuPanel>
          ) : null}
        </ManualMenuWrapper>
      </ActionRow>
    </SplitWrapRow>
  );
}
