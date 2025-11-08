interface TrueFalseAnswersProps {
  userAnswer: string | null;
  onSubmit: (value: string) => void;
}

export function TrueFalseAnswers({
  userAnswer,
  onSubmit,
}: TrueFalseAnswersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <button
        type="button"
        onClick={() => onSubmit("true")}
        disabled={userAnswer !== null}
        className="bg-gradient-to-br from-success-500 to-accent-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in"
      >
        <div className="text-7xl sm:text-8xl mb-4">✓</div>
        <div className="text-3xl sm:text-4xl font-black">VRAI</div>
      </button>
      <button
        type="button"
        onClick={() => onSubmit("false")}
        disabled={userAnswer !== null}
        className="bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in animation-delay-100"
      >
        <div className="text-7xl sm:text-8xl mb-4">✗</div>
        <div className="text-3xl sm:text-4xl font-black">FAUX</div>
      </button>
    </div>
  );
}
