import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useOrganization } from "../../../context/OrganizationContext";
import { ArcadePage, Container } from "../../../../../../presentation/shared/ui/components";
import type { OrganizationStatItem } from "./types";
import { EmptyOrganizationState } from "./components/EmptyOrganizationState";
import { OrganizationHeader } from "./components/OrganizationHeader";
import { OrganizationStatsGrid } from "./components/OrganizationStatsGrid";
import { OrganizationDetailsCard } from "./components/OrganizationDetailsCard";

const ORGANIZATION_ICON = { name: "Building2", tone: "accent" } as const;

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
        icon: { name: "BookOpen", tone: "accent" },
        variant: "primary",
      },
      {
        label: t("organization.gameSessions"),
        value: stats.totalGameSessions,
        icon: { name: "Gamepad2", tone: "accent" },
        variant: "secondary",
      },
      {
        label: t("organization.activeSessions"),
        value: stats.activeGameSessions,
        icon: { name: "Target", tone: "inverted" },
        variant: "accent",
      },
      {
        label: t("organization.members"),
        value: stats.totalMembers,
        icon: { name: "Users", tone: "accent" },
        variant: "purple",
      },
    ];
  }, [dashboard, t]);

  const createdDate = useMemo(() => {
    const locale = i18n.language || undefined;
    return new Date(currentOrganization.createdAt).toLocaleDateString(locale);
  }, [currentOrganization.createdAt, i18n.language]);

  return (
    <ArcadePage
      variant="gradient"
      padding="lg"
      contentWidth="xl"
      gap="lg"
      verticalAlign="start"
      data-organization-dashboard="true"
    >
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
    </ArcadePage>
  );
}
