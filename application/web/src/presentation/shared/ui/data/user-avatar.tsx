import { Avatar } from '@mantine/core';
import { authAvatarFrameStyle } from '../foundation/ui-theme';

type UserAvatarAppearance = 'default' | 'framed';

interface UserAvatarProps {
  readonly alt: string;
  readonly appearance?: UserAvatarAppearance;
  readonly size?: number;
  readonly src?: string | null;
}

export function UserAvatar({ alt, appearance = 'default', size = 80, src }: UserAvatarProps) {
  return (
    <Avatar
      alt={alt}
      radius="50%"
      size={size}
      src={src}
      styles={appearance === 'framed' ? { root: authAvatarFrameStyle } : undefined}
    >
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
