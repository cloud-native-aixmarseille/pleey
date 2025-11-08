import { Avatar, Button } from "../../../../../shared/components";
import type { User } from "../../../../../shared/types";

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.username} src={user.avatarUrl} size="lg" />
        <div>
          <p className="text-sm text-light-600 uppercase tracking-wide">
            {viewingAsLabel}
          </p>
          <h1 className="text-3xl font-black text-gradient-neon">
            {user.username}
          </h1>
          <p className="text-light-700">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={disableRegenerate}
          className="w-full sm:w-auto"
        >
          {isRegenerating ? loadingLabel : regenerateLabel}
        </Button>
      </div>
    </div>
  );
}
