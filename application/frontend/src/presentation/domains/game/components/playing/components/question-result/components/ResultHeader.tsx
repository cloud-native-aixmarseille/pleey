interface ResultHeaderProps {
  isCorrect: boolean;
  title: string;
}

export function ResultHeader({ isCorrect, title }: ResultHeaderProps) {
  return (
    <div className="mb-6 text-center" data-result-header="true">
      <div className="mb-6 text-7xl animate-bounce-slow sm:text-8xl">
        {isCorrect ? "🎉" : "😢"}
      </div>
      <h3 className="font-display text-4xl font-black uppercase tracking-[0.3em] sm:text-5xl">
        {title}
      </h3>
    </div>
  );
}
