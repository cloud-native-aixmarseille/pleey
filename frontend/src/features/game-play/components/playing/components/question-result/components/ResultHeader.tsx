interface ResultHeaderProps {
  isCorrect: boolean;
  title: string;
}

export function ResultHeader({ isCorrect, title }: ResultHeaderProps) {
  return (
    <div className="text-center mb-6">
      <div className="text-7xl sm:text-8xl mb-6 animate-bounce-slow">
        {isCorrect ? "🎉" : "😢"}
      </div>
      <h3 className="text-4xl sm:text-5xl font-black text-center font-display uppercase">
        {title}
      </h3>
    </div>
  );
}
