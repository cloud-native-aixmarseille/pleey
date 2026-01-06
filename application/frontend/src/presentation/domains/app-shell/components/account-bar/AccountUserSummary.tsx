import { memo } from "react";

import { Avatar } from "../../../../../presentation/shared/ui/components";

const USER_SUMMARY_CONTAINER_CLASSES =
  "flex items-center gap-3 whitespace-nowrap rounded-3xl border border-primary-500/20 bg-light-50/70 px-4 py-2 text-dark-500 dark:bg-dark-500/60 dark:text-light-100";
const USER_SUMMARY_TEXT_STACK_CLASSES = "flex flex-col leading-tight";
const USER_SUMMARY_NAME_CLASSES =
  "text-sm font-semibold text-dark-500 dark:text-light-100";
const USER_SUMMARY_EMAIL_CLASSES = "text-xs text-dark-300 dark:text-light-500";

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
