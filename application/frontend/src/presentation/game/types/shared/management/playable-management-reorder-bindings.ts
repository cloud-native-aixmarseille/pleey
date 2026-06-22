import type { Dispatch, DragEvent, SetStateAction } from 'react';
import {
  type PlayableManagementDropPreview,
  playableManagementDragPlacement,
} from './playable-management-drag-placement';

interface CreatePlayableManagementReorderBindingsOptions {
  readonly draggedIndex: number | null;
  readonly dropPreview: PlayableManagementDropPreview | null;
  readonly enabled?: boolean;
  readonly index: number;
  readonly moveItem: (fromIndex: number, toIndex: number) => void;
  readonly setDraggedIndex: Dispatch<SetStateAction<number | null>>;
  readonly setDropPreview: Dispatch<SetStateAction<PlayableManagementDropPreview | null>>;
}

interface PlayableManagementReorderBindings<Element extends HTMLElement> {
  readonly draggable: boolean;
  readonly isDragging: boolean;
  readonly isDropTarget: boolean;
  readonly onDragEnd: () => void;
  readonly onDragLeave: (event: DragEvent<Element>) => void;
  readonly onDragOver: (event: DragEvent<Element>) => void;
  readonly onDragStart: (event: DragEvent<Element>) => void;
  readonly onDrop: (event: DragEvent<Element>) => void;
}

export function createPlayableManagementReorderBindings<Element extends HTMLElement>({
  draggedIndex,
  dropPreview,
  enabled = true,
  index,
  moveItem,
  setDraggedIndex,
  setDropPreview,
}: CreatePlayableManagementReorderBindingsOptions): PlayableManagementReorderBindings<Element> {
  const resetReorderState = () => {
    setDraggedIndex(null);
    setDropPreview(null);
  };

  return {
    draggable: enabled,
    isDragging: draggedIndex === index,
    isDropTarget: dropPreview?.hoveredIndex === index,
    onDragEnd: resetReorderState,
    onDragLeave: (event) => {
      if (!enabled) {
        return;
      }

      const relatedTarget = event.relatedTarget;

      if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
        setDropPreview((current) => (current?.hoveredIndex === index ? null : current));
      }
    },
    onDragOver: (event) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();
      const edge = playableManagementDragPlacement.resolveDropEdge(event);

      setDropPreview({
        hoveredIndex: index,
        slot: playableManagementDragPlacement.resolveDisplaySlot(index, edge),
      });
    },
    onDragStart: (event) => {
      if (!enabled) {
        return;
      }

      setDraggedIndex(index);
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    },
    onDrop: (event) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();
      const fromIndex = Number(event.dataTransfer.getData('text/plain'));
      const edge = playableManagementDragPlacement.resolveDropEdge(event);
      const slot = playableManagementDragPlacement.resolveDisplaySlot(index, edge);

      resetReorderState();

      if (Number.isInteger(fromIndex)) {
        const toIndex = playableManagementDragPlacement.resolveInsertionIndex(fromIndex, slot);

        if (toIndex !== fromIndex) {
          moveItem(fromIndex, toIndex);
        }
      }
    },
  };
}
