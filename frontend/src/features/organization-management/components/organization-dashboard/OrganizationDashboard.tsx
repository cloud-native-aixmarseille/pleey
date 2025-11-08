import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useOrganization } from "../../../../shared/context/OrganizationContext";
import { Container } from "../../../../shared/components";
import type { OrganizationStatItem } from "./types";
import { EmptyOrganizationState } from "./components/EmptyOrganizationState";
import { OrganizationHeader } from "./components/OrganizationHeader";
import { OrganizationStatsGrid } from "./components/OrganizationStatsGrid";
import { OrganizationDetailsCard } from "./components/OrganizationDetailsCard";

const ORGANIZATION_ICON = "🏢";

export function OrganizationDashboard() {
  const { t, i18n } = useTranslation();
  const { currentOrganization, dashboard } = useOrganization();

  if (!currentOrganization) {
    return (
      <EmptyOrganizationState
        title={t("organization.noOrganizationSelected")}
        description={t("organization.selectToView")}
      />
    );
  }

  const statsItems = useMemo<OrganizationStatItem[]>(() => {
    if (!dashboard) {
      return [];
    }

    const { stats } = dashboard;

    return [
      {
        label: t("organization.totalQuizzes"),
        value: stats.totalQuizzes,
        icon: "📚",
        variant: "primary",
      },
      {
        label: t("organization.gameSessions"),
        value: stats.totalGameSessions,
        icon: "🎮",
        variant: "secondary",
      },
      {
        label: t("organization.activeSessions"),
        value: stats.activeGameSessions,
        icon: "🎯",
        variant: "accent",
      },
      {
        label: t("organization.members"),
        value: stats.totalMembers,
        icon: "👥",
        variant: "purple",
      },
    ];
  }, [dashboard, t]);

  const createdDate = useMemo(() => {
    const locale = i18n.language || undefined;
    return new Date(currentOrganization.createdAt).toLocaleDateString(locale);
  }, [currentOrganization.createdAt, i18n.language]);

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8">
      <Container size="xl">
        <OrganizationHeader
          organization={currentOrganization}
          icon={ORGANIZATION_ICON}
        />

        <OrganizationStatsGrid stats={statsItems} />

        <OrganizationDetailsCard
          organization={currentOrganization}
          createdDate={createdDate}
          labels={{
            title: t("organization.organizationDetails"),
            name: t("organization.organizationNameLabel"),
            description: t("organization.descriptionLabel"),
            created: t("organization.created"),
          }}
        />
      </Container>
    </div>
  );
}
