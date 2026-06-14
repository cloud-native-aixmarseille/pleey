import { useState } from 'react';
import type { PlayableManagementState } from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, SplitWrapRow } from '../../../../shared/ui/layout/containers';
import { Eyebrow, Heading, SupportingText } from '../../../../shared/ui/layout/typography';

interface PlayableManagementHeaderProps {
  readonly state: PlayableManagementState;
  readonly translationRoot: string;
  readonly saveStateLabel: string;
  readonly onBack: () => void;
  readonly onDeleteGame: () => void;
  readonly onEditGame: () => void;
}

const menuWrapperStyle = {
  position: 'relative',
} as const;

const menuStyle = {
  background: uiThemeTokens.color.surface.canvas,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: '1rem',
  boxShadow: uiThemeTokens.shadow.elevated,
  display: 'grid',
  gap: '0.25rem',
  minWidth: '13rem',
  padding: '0.5rem',
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 0.5rem)',
  zIndex: 10,
} as const;

const menuItemStyle = {
  '--button-bd': '1px solid transparent',
  '--button-bg': 'transparent',
  '--button-color': 'inherit',
  '--button-hover': uiThemeTokens.color.surface.recessed,
  '--button-hover-color': uiThemeTokens.color.text.primary,
  borderRadius: '0.75rem',
  justifyContent: 'flex-start',
  padding: '0.6rem 0.75rem',
} as const;

const dangerMenuItemStyle = {
  ...menuItemStyle,
  '--button-color': 'var(--mantine-color-red-3)',
} as const;

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
        <div style={menuWrapperStyle}>
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
            <div role="menu" style={menuStyle}>
              <Button
                fullWidth
                intent="ghost"
                labelStyle={{ textAlign: 'left', width: '100%' }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onEditGame();
                }}
                role="menuitem"
                rootStyle={menuItemStyle}
                size="sm"
                type="button"
              >
                {t(`${translationRoot}.editGame`)}
              </Button>
              <Button
                fullWidth
                intent="ghost"
                labelStyle={{ textAlign: 'left', width: '100%' }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteGame();
                }}
                role="menuitem"
                rootStyle={dangerMenuItemStyle}
                size="sm"
                type="button"
              >
                {t(`${translationRoot}.deleteGame`)}
              </Button>
            </div>
          ) : null}
        </div>
      </ActionRow>
    </SplitWrapRow>
  );
}
