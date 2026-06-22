import type { CSSProperties } from 'react';

const mobileGridBaseStyle: CSSProperties = {
  display: 'grid',
  flex: '1 1 auto',
  gap: '0.5rem',
  gridTemplateColumns: '1fr 1fr',
  minHeight: 0,
  width: '100%',
};

export const mobileTileWrapperStyle: CSSProperties = {
  display: 'flex',
  minHeight: 0,
};

export function resolveMobileGridStyle(actionCount: number): CSSProperties {
  const rowCount = Math.max(1, Math.ceil(actionCount / 2));

  return {
    ...mobileGridBaseStyle,
    gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
  };
}
