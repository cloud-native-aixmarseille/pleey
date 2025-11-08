import { Question } from "../../../../../shared/types";
import { ANSWER_OPTION_KEYS, AnswerOptionKey } from "../constants";

interface WaitingForAnswersProps {
  question: Question;
}

export function WaitingForAnswers({ question }: WaitingForAnswersProps) {
  if (question.type === "multiple") {
    const optionTextMap: Record<AnswerOptionKey, string | null | undefined> = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };

    return (
      <div>
        <div className="text-center mb-6">
          <p className="font-display text-accent-500 text-xl sm:text-2xl uppercase tracking-wider animate-pulse-slow">
            ⏳ Waiting for players to answer...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-80">
          {ANSWER_OPTION_KEYS.map((optionKey, index) => {
            const optionText = optionTextMap[optionKey];
            const className = `answer-option-${optionKey.toLowerCase()}`;

            return (
              <div
                key={optionKey}
                className={`
                      ${className}
                      text-white p-8 sm:p-10 rounded-3xl shadow-float
                      border-4 border-white/30
                      animate-scale-in
                    `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl sm:text-6xl font-black">
                      {optionKey}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                      {optionText ?? ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <p className="font-display text-accent-500 text-xl sm:text-2xl uppercase tracking-wider animate-pulse-slow">
          ⏳ Waiting for players to answer...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-80">
        <div className="bg-gradient-to-br from-success-500 to-accent-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in">
          <div className="text-8xl sm:text-9xl mb-6 text-center">✓</div>
          <div className="text-4xl sm:text-5xl font-black text-center font-display uppercase">
            VRAI
          </div>
        </div>
        <div className="bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in animation-delay-100">
          <div className="text-8xl sm:text-9xl mb-6 text-center">✗</div>
          <div className="text-4xl sm:text-5xl font-black text-center font-display uppercase">
            FAUX
          </div>
        </div>
      </div>
    </div>
  );
}
