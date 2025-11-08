import { useTranslation } from "react-i18next";
import { Button, Card } from "../../../../shared/components";
import { OrganizationSelector } from "../../../../shared/components/organization/OrganizationSelector";

interface AdminDashboardHeaderProps {
  onOpenCreateModal: () => void;
  isCreateDisabled: boolean;
}

export function AdminDashboardHeader({
  onOpenCreateModal,
  isCreateDisabled,
}: AdminDashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl animate-bounce-slow">👑</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
              {t("admin.dashboard")}
            </h2>
          </div>
          <p className="text-light-700">{t("admin.manageQuizzesSubtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <OrganizationSelector />
          <Button
            variant="accent"
            size="lg"
            onClick={onOpenCreateModal}
            disabled={isCreateDisabled}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {t("admin.createQuiz")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
