import { Divider } from '@mantine/core';
import type React from 'react';

interface SeparatorProps {
  readonly style?: React.CSSProperties;
}

export function Separator({ style }: SeparatorProps) {
  return <Divider style={style} />;
}
