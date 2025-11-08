import { useTranslation } from "react-i18next";
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
      <StatsCard
        label={t("admin.totalQuizzes")}
        value={totalQuizzes}
        icon="📚"
        variant="primary"
      />
      <StatsCard
        label={t("admin.activeQuizzes")}
        value={activeQuizCount}
        icon="🎯"
        variant="secondary"
      />
      <StatsCard
        label={t("admin.questions")}
        value={totalQuestions}
        icon="❓"
        variant="accent"
      />
    </div>
  );
}
