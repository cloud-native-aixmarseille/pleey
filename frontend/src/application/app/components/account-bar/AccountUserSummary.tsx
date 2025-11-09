import { memo } from "react";
import { Avatar } from "../../../../shared/components";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AccountUserSummary", {
  slot1: "flex items-center gap-3 rounded-3xl border border-primary-500/20 bg-dark-500/60 px-4 py-2 whitespace-nowrap",
  slot2: "flex flex-col leading-tight",
  slot3: "text-sm font-semibold text-light-100",
  slot4: "text-xs text-light-500",
});


interface AccountUserSummaryProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
}

function AccountUserSummaryComponent({
  username,
  email,
  avatarUrl,
}: AccountUserSummaryProps) {
  return (
    <div {...styles.slot1}>
      <Avatar name={username} src={avatarUrl ?? undefined} size="sm" />
      <div {...styles.slot2}>
        <span {...styles.slot3}>{username}</span>
        <span {...styles.slot4}>{email}</span>
      </div>
    </div>
  );
}

export const AccountUserSummary = memo(AccountUserSummaryComponent);
