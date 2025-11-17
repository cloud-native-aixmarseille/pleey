import { useTranslation } from "react-i18next";
import { ArcadeCardGrid } from "../../../../shared/components";
import { StatsCard } from "../../../../shared/components/stats/StatsCard";

interface AdminStatsSectionProps {
  totalQuizzes: number;
  activeQuizCount: number;
  totalQuestions: number;
}

export function AdminStatsSection({
  totalQuizzes,
  activeQuizCount,
  totalQuestions,
}: AdminStatsSectionProps) {
  const { t } = useTranslation();

  return (
    <ArcadeCardGrid layout="triple">
      <StatsCard
        label={t("admin.totalQuizzes")}
        value={totalQuizzes}
        icon={{ name: "Library", tone: "accent" }}
        variant="primary"
      />
      <StatsCard
        label={t("admin.activeQuizzes")}
        value={activeQuizCount}
        icon={{ name: "Target", tone: "accent" }}
        variant="secondary"
      />
      <StatsCard
        label={t("admin.questions")}
        value={totalQuestions}
        icon={{ name: "HelpCircle", tone: "inverted" }}
        variant="accent"
      />
    </ArcadeCardGrid>
  );
}
