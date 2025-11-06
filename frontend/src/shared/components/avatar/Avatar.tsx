import { memo, useMemo } from "react";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles: Record<Required<AvatarProps>["size"], string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
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

function AvatarComponent({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border-2 border-primary-500/40 shadow-lg ${sizeStyles[size]} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center border-2 border-primary-400/70 shadow-lg ${sizeStyles[size]} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export const Avatar = memo(AvatarComponent);

export default Avatar;
