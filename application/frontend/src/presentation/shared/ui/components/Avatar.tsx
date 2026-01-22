import { memo, useMemo } from "react";
import { resolveAvatarUri } from "../../utils/resolveAvatarUri";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_STYLES: Record<Required<AvatarProps>["size"], string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
};

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function AvatarComponent({ name, src, size = "md" }: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const resolvedSrc = useMemo(() => resolveAvatarUri(src), [src]);

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        className={`rounded-full object-cover border-2 border-primary-500/40 shadow-lg ${SIZE_STYLES[size]}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center border-2 border-primary-400/70 shadow-lg ${SIZE_STYLES[size]}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export const Avatar = memo(AvatarComponent);

export default Avatar;
