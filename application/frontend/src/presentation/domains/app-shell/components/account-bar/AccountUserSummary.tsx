import { memo } from "react";

import { Avatar } from "../../../../../presentation/shared/ui/components";

const USER_SUMMARY_CONTAINER_CLASSES =
  "flex items-center gap-3 whitespace-nowrap rounded-3xl border px-4 py-2 text-[color:var(--arcade-color-text-primary)] bg-[color:var(--arcade-color-surface-muted)] border-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_20%,transparent)]";
const USER_SUMMARY_TEXT_STACK_CLASSES = "flex flex-col leading-tight";
const USER_SUMMARY_NAME_CLASSES =
  "text-sm font-semibold text-[color:var(--arcade-color-text-primary)]";
const USER_SUMMARY_EMAIL_CLASSES =
  "text-xs text-[color:var(--arcade-color-text-muted)]";

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
    <div
      className={USER_SUMMARY_CONTAINER_CLASSES}
      data-account-user-summary="true"
    >
      <Avatar name={username} src={avatarUrl ?? undefined} size="sm" />
      <div className={USER_SUMMARY_TEXT_STACK_CLASSES}>
        <span className={USER_SUMMARY_NAME_CLASSES}>{username}</span>
        <span className={USER_SUMMARY_EMAIL_CLASSES}>{email}</span>
      </div>
    </div>
  );
}

export const AccountUserSummary = memo(AccountUserSummaryComponent);
