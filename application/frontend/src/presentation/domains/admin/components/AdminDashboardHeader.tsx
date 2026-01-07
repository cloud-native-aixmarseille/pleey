import { useTranslation } from "react-i18next";

import {
  ArcadeSectionHeader,
  Card,
  PrimaryButton,
} from "../../../../presentation/shared/ui/components";
import { OrganizationSelector } from "./organization/OrganizationSelector";

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
    <div className="mb-4">
      <Card motion="fade">
        <ArcadeSectionHeader
          icon="👑"
          title={t("admin.dashboard")}
          subtitle={t("admin.manageQuizzesSubtitle")}
          actions={
            <>
              <OrganizationSelector />
              <PrimaryButton
                size="lg"
                onClick={onOpenCreateModal}
                disabled={isCreateDisabled}
                icon={{ name: "Plus" }}
              >
                {t("admin.createQuiz")}
              </PrimaryButton>
            </>
          }
        />
      </Card>
    </div>
  );
}
