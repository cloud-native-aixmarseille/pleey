interface MultipleChoiceAnswersProps {
  options: Array<{
    letter: string;
    text: string;
    className: string;
  }>;
  userAnswer: string | null;
  onSubmit: (value: string) => void;
}

export function MultipleChoiceAnswers({
  options,
  userAnswer,
  onSubmit,
}: MultipleChoiceAnswersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {options.map((option, index) => (
        <button
          key={option.letter}
          type="button"
          onClick={() => onSubmit(option.letter)}
          disabled={userAnswer !== null}
          className={`${option.className} text-white p-6 sm:p-8 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed animate-scale-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black">
                {option.letter}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-xl sm:text-2xl font-bold">{option.text}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
