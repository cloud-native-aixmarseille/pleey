import { memo } from "react";
import { Avatar } from "../../../../shared/components";

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
    <div className="flex items-center gap-3 rounded-3xl border border-primary-500/20 bg-dark-500/60 px-4 py-2 whitespace-nowrap">
      <Avatar name={username} src={avatarUrl ?? undefined} size="sm" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-light-100">{username}</span>
        <span className="text-xs text-light-500">{email}</span>
      </div>
    </div>
  );
}

export const AccountUserSummary = memo(AccountUserSummaryComponent);
