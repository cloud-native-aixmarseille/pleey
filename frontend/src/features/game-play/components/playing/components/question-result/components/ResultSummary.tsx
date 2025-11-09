import { createStyles } from "../../../../../../../shared/ui/styles";

const styles = createStyles("ResultSummary", {
  slot1: "glass-effect rounded-2xl p-6 mb-8 border-2 border-white/30",
  slot2: "text-2xl sm:text-3xl font-bold text-center font-body",
});

interface ResultSummaryProps {
  summary: string;
}

export function ResultSummary({ summary }: ResultSummaryProps) {
  return (
    <div {...styles.slot1}>
      <p {...styles.slot2}>
        {summary}
      </p>
    </div>
  );
}
