import { Avatar, Button } from "../../../../../shared/components";
import type { User } from "../../../../../shared/types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("ProfileHeader", {
  slot1: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6",
  slot2: "flex items-center gap-4",
  slot3: "text-sm text-light-600 uppercase tracking-wide",
  slot4: "text-3xl font-black text-gradient-neon",
  slot5: "text-light-700",
  slot6: "flex flex-col sm:flex-row gap-3 w-full sm:w-auto",
  slot7: "w-full sm:w-auto",
});


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
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <Avatar name={user.username} src={user.avatarUrl} size="lg" />
        <div>
          <p {...styles.slot3}>
            {viewingAsLabel}
          </p>
          <h1 {...styles.slot4}>
            {user.username}
          </h1>
          <p {...styles.slot5}>{subtitle}</p>
        </div>
      </div>
      <div {...styles.slot6}>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={disableRegenerate}
          {...styles.slot7}
        >
          {isRegenerating ? loadingLabel : regenerateLabel}
        </Button>
      </div>
    </div>
  );
}
