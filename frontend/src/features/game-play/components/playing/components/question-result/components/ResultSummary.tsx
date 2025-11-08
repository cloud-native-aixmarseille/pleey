interface ResultSummaryProps {
  summary: string;
}

export function ResultSummary({ summary }: ResultSummaryProps) {
  return (
    <div className="glass-effect rounded-2xl p-6 mb-8 border-2 border-white/30">
      <p className="text-2xl sm:text-3xl font-bold text-center font-body">
        {summary}
      </p>
    </div>
  );
}
