import type { DragEvent } from 'react';

type PlayableManagementDropEdge = 'before' | 'after';

export interface PlayableManagementDropPreview {
  readonly hoveredIndex: number;
  readonly slot: number;
}

interface PlayableManagementDragPlacement {
  resolveDropEdge<Element extends HTMLElement>(
    event: DragEvent<Element>,
  ): PlayableManagementDropEdge;

  resolveDisplaySlot(targetIndex: number, edge: PlayableManagementDropEdge): number;

  resolveInsertionIndex(fromIndex: number, slot: number): number;
}

export const playableManagementDragPlacement: PlayableManagementDragPlacement = {
  resolveDropEdge<Element extends HTMLElement>(
    event: DragEvent<Element>,
  ): PlayableManagementDropEdge {
    const bounds = event.currentTarget.getBoundingClientRect();

    return event.clientY - bounds.top < bounds.height / 2 ? 'before' : 'after';
  },

  resolveDisplaySlot(targetIndex: number, edge: PlayableManagementDropEdge): number {
    return edge === 'before' ? targetIndex : targetIndex + 1;
  },

  resolveInsertionIndex(fromIndex: number, slot: number): number {
    return slot > fromIndex ? slot - 1 : slot;
  },
};
