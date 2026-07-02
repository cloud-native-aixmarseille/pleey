import type { CSSProperties } from 'react';

const mobileGridBaseStyle: CSSProperties = {
  display: 'grid',
  flex: '1 1 auto',
  gap: '0.5rem',
  minHeight: 0,
  width: '100%',
};

export const mobileTileWrapperStyle: CSSProperties = {
  display: 'flex',
  minHeight: 0,
};

export function resolveMobileGridStyle(actionCount: number): CSSProperties {
  const resolvedActionCount = Math.max(1, actionCount);

  if (resolvedActionCount === 1) {
    return {
      ...mobileGridBaseStyle,
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'minmax(0, 1fr)',
    };
  }

  if (resolvedActionCount === 2) {
    return {
      ...mobileGridBaseStyle,
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'minmax(0, 1fr)',
    };
  }

  return {
    ...mobileGridBaseStyle,
    gridTemplateColumns: '1fr',
    gridTemplateRows: `repeat(${resolvedActionCount}, minmax(0, 1fr))`,
  };
}
