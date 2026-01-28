import { Avatar } from '@mantine/core';
import type React from 'react';

interface UserAvatarProps {
  readonly alt: string;
  readonly size?: number;
  readonly src?: string | null;
  readonly style?: React.CSSProperties;
}

export function UserAvatar({ alt, size = 80, src, style }: UserAvatarProps) {
  return (
    <Avatar alt={alt} radius="50%" size={size} src={src} style={style}>
      {toInitials(alt)}
    </Avatar>
  );
}

function toInitials(label: string): string {
  const words = label
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2);

  if (words.length === 0) {
    return '?';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
}
