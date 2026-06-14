import { useState } from 'react';
import type { PlayableManagementItem } from '../../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow } from '../../../../../shared/ui/layout/containers';
import { DashedNoticePanel, ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../../../../workspace/shared/contexts/workspace-dependencies-context';
import type { PlayableItemKindConfig } from '../playable-content-management-model';
import type { PlayableManagementDropPreview } from '../playable-management-drag-placement';
import { PlayableManagementStageRailItem } from './playable-management-stage-rail-item';
import { dropIndicatorStyle, listStyle } from './stage-rail-styles';

interface PlayableManagementStageRailProps {
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly items: readonly PlayableManagementItem[];
  readonly selectedItemId: string | null;
  readonly translationRoot: string;
  readonly onAddItem: () => void;
  readonly onDeleteItem: (item: PlayableManagementItem) => void;
  readonly onMoveItem: (fromIndex: number, toIndex: number) => void;
  readonly onSelectItem: (item: PlayableManagementItem) => void;
}

export function PlayableManagementStageRail({
  itemKindConfig,
  items,
  onAddItem,
  onDeleteItem,
  onMoveItem,
  onSelectItem,
  selectedItemId,
  translationRoot,
}: PlayableManagementStageRailProps) {
  const { t } = usePresentationTranslation();
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropPreview, setDropPreview] = useState<PlayableManagementDropPreview | null>(null);
  const [hoveredHandleIndex, setHoveredHandleIndex] = useState<number | null>(null);

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="md">
        <SplitWrapRow>
          <Heading level={2}>{t(`${translationRoot}.itemsTitle`)}</Heading>
          <Button leftSection={<AppIcon name="plus" size={14} />} onClick={onAddItem} size="sm">
            {t(`${translationRoot}.createItem`)}
          </Button>
        </SplitWrapRow>

        {items.length === 0 ? (
          <DashedNoticePanel>{t(`${translationRoot}.empty`)}</DashedNoticePanel>
        ) : (
          <ol aria-label={t(`${translationRoot}.itemsTitle`)} style={listStyle}>
            {items.map((item, index) => (
              <PlayableManagementStageRailItem
                draggedIndex={draggedIndex}
                dropPreview={dropPreview}
                hoveredHandleIndex={hoveredHandleIndex}
                index={index}
                item={item}
                itemKindConfig={itemKindConfig}
                itemsLength={items.length}
                key={item.id}
                onDeleteItem={onDeleteItem}
                onMoveItem={onMoveItem}
                onSelectItem={onSelectItem}
                playableItemEditorValidator={playableItemEditorValidator}
                selectedItemId={selectedItemId}
                setDraggedIndex={setDraggedIndex}
                setDropPreview={setDropPreview}
                setHoveredHandleIndex={setHoveredHandleIndex}
                translationRoot={translationRoot}
              />
            ))}
            {dropPreview?.slot === items.length ? (
              <li aria-hidden="true">
                <div style={dropIndicatorStyle} />
              </li>
            ) : null}
          </ol>
        )}
      </ContentStack>
    </ElevatedPanel>
  );
}
