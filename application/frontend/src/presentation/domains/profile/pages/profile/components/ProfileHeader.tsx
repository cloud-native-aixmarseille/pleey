import {
  Avatar,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import type { User } from "../../../../../../domains/auth/types";

const HEADER_WRAPPER_CLASSES =
  "flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center";
const USER_ROW_CLASSES = "flex items-center gap-4";
const VIEWING_AS_CLASSES = "text-sm uppercase tracking-wide text-light-600";
const USERNAME_CLASSES = "font-black text-3xl text-gradient-neon";
const SUBTITLE_CLASSES = "text-light-700";
const ACTIONS_STACK_CLASSES =
  "flex w-full flex-col gap-3 sm:w-auto sm:flex-row";

interface ProfileHeaderProps {
  user: User;
  viewingAsLabel: string;
  subtitle: string;
  regenerateLabel: string;
  loadingLabel: string;
  onRegenerate: () => void;
  disableRegenerate: boolean;
  isRegenerating: boolean;
}

export function ProfileHeader({
  user,
  viewingAsLabel,
  subtitle,
  regenerateLabel,
  loadingLabel,
  onRegenerate,
  disableRegenerate,
  isRegenerating,
}: ProfileHeaderProps) {
  return (
    <div className={HEADER_WRAPPER_CLASSES}>
      <div className={USER_ROW_CLASSES}>
        <Avatar name={user.username} src={user.avatarUri} size="lg" />
        <div>
          <p className={VIEWING_AS_CLASSES}>{viewingAsLabel}</p>
          <h1 className={USERNAME_CLASSES}>{user.username}</h1>
          <p className={SUBTITLE_CLASSES}>{subtitle}</p>
        </div>
      </div>
      <div className={ACTIONS_STACK_CLASSES}>
        <SecondaryButton
          type="button"
          onClick={onRegenerate}
          disabled={disableRegenerate}
          fullWidth
        >
          {isRegenerating ? loadingLabel : regenerateLabel}
        </SecondaryButton>
      </div>
    </div>
  );
}
