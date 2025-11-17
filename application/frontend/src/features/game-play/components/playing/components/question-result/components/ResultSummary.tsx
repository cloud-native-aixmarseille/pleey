import { Card } from "../../../../../../../shared/components";

const SUMMARY_WRAPPER_CLASSES = "mb-8 animate-scale-in";
const SUMMARY_TEXT_CLASSES =
  "font-body text-2xl font-bold text-center text-light-100 sm:text-3xl";

interface ResultSummaryProps {
  summary: string;
}

export function ResultSummary({ summary }: ResultSummaryProps) {
  return (
    <div className={SUMMARY_WRAPPER_CLASSES} data-result-summary="true">
      <Card
        surface="glass"
        tone="neutral"
        padding="lg"
        elevation="glow"
        border="regular"
        alignment="center"
      >
        <p className={SUMMARY_TEXT_CLASSES}>{summary}</p>
      </Card>
    </div>
  );
}
