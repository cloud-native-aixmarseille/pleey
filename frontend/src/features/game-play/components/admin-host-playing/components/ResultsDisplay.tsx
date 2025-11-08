import { Button, Card } from "../../../../../shared/components";
import { AnswerResult, Question } from "../../../../../shared/types";
import {
  ANSWER_OPTION_KEYS,
  MIN_DISPLAY_PERCENTAGE,
  AnswerOptionKey,
} from "../constants";

interface ResultsDisplayProps {
  question: Question;
  answerResult: AnswerResult;
  onNextQuestion: () => void;
}

type DistributionKey = AnswerOptionKey | "true" | "false";

function getPercentage(answerResult: AnswerResult, option: DistributionKey) {
  const { statistics } = answerResult;

  if (!statistics || statistics.totalAnswers === 0) {
    return 0;
  }

  const count = statistics.answerDistribution[option] || 0;
  return Math.round((count / statistics.totalAnswers) * 100);
}

function getOptionColor(answerResult: AnswerResult, option: DistributionKey) {
  if (option === answerResult.correctAnswer) {
    return "from-success-500 to-accent-500";
  }

  return "from-primary-500 to-secondary-500";
}

function getMultipleChoiceText(
  question: Question,
  option: AnswerOptionKey
): string {
  switch (option) {
    case "A":
      return question.option_a ?? "";
    case "B":
      return question.option_b ?? "";
    case "C":
      return question.option_c ?? "";
    case "D":
      return question.option_d ?? "";
    default:
      return "";
  }
}

export function ResultsDisplay({
  question,
  answerResult,
  onNextQuestion,
}: ResultsDisplayProps) {
  const statistics = answerResult.statistics;
  const totalResponses = statistics?.totalAnswers ?? 0;
  const distribution: Partial<Record<DistributionKey, number>> =
    statistics?.answerDistribution ?? {};

  return (
    <Card className="p-8 sm:p-12 bg-gradient-to-br from-accent-500 to-primary-600 text-white animate-scale-in border-4 border-accent-400">
      <div className="text-center mb-8">
        <div className="text-8xl sm:text-9xl mb-4 animate-bounce-slow">🎯</div>
        <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 font-display uppercase animate-glow">
          RESULTS
        </h3>
        <div className="inline-block glass-effect rounded-2xl px-8 py-4 border-2 border-white/50">
          <p className="text-3xl sm:text-4xl font-bold font-body">
            Correct Answer:{" "}
            <span className="text-success-200">
              {answerResult.correctAnswer}
            </span>
          </p>
        </div>
      </div>

      {statistics && totalResponses > 0 && (
        <div className="glass-effect rounded-2xl p-8 border-4 border-white/30 animate-fade-in">
          <h4 className="text-2xl sm:text-3xl font-bold mb-6 text-center font-display uppercase">
            📊 Player Responses
          </h4>

          <div className="space-y-4">
            {question.type === "multiple"
              ? ANSWER_OPTION_KEYS.map((optionKey) => {
                  const optionText = getMultipleChoiceText(question, optionKey);
                  const percentage = getPercentage(answerResult, optionKey);
                  const count = distribution[optionKey] || 0;
                  const isCorrect = optionKey === answerResult.correctAnswer;

                  return (
                    <div key={optionKey} className="relative">
                      <div className="flex items-center justify-between mb-2 text-lg sm:text-xl font-mono">
                        <span className="font-bold flex items-center gap-2">
                          <span className="text-2xl">{optionKey}.</span>
                          <span>{optionText}</span>
                          {isCorrect && <span className="text-3xl">✓</span>}
                        </span>
                        <span className="font-black text-2xl sm:text-3xl">
                          {percentage}%
                        </span>
                      </div>
                      <div className="relative h-12 sm:h-16 bg-dark-700/50 rounded-2xl overflow-hidden border-2 border-white/30">
                        <div
                          className={`h-full bg-gradient-to-r ${getOptionColor(
                            answerResult,
                            optionKey
                          )} transition-all duration-1000 flex items-center justify-end px-4 sm:px-6`}
                          style={{
                            width: `${percentage}%`,
                            animationDelay: `${
                              0.1 * ANSWER_OPTION_KEYS.indexOf(optionKey)
                            }s`,
                          }}
                        >
                          {percentage > MIN_DISPLAY_PERCENTAGE && (
                            <span className="text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                              {count} player{count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              : (["true", "false"] as const).map((optionKey, index) => {
                  const label = optionKey === "true" ? "VRAI" : "FAUX";
                  const icon = optionKey === "true" ? "✓" : "✗";
                  const percentage = getPercentage(answerResult, optionKey);
                  const count = distribution[optionKey] || 0;
                  const isCorrect = optionKey === answerResult.correctAnswer;

                  return (
                    <div key={optionKey} className="relative">
                      <div className="flex items-center justify-between mb-2 text-lg sm:text-xl font-mono">
                        <span className="font-bold uppercase flex items-center gap-2">
                          <span className="text-2xl">{icon}</span>
                          <span>{label}</span>
                          {isCorrect && <span className="text-3xl">✓</span>}
                        </span>
                        <span className="font-black text-2xl sm:text-3xl">
                          {percentage}%
                        </span>
                      </div>
                      <div className="relative h-12 sm:h-16 bg-dark-700/50 rounded-2xl overflow-hidden border-2 border-white/30">
                        <div
                          className={`h-full bg-gradient-to-r ${getOptionColor(
                            answerResult,
                            optionKey
                          )} transition-all duration-1000 flex items-center justify-end px-4 sm:px-6`}
                          style={{
                            width: `${percentage}%`,
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          {percentage > MIN_DISPLAY_PERCENTAGE && (
                            <span className="text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                              {count} player{count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>

          <div className="text-center mt-6">
            <div className="inline-block glass-effect rounded-xl px-6 py-3 border-2 border-white/30">
              <p className="text-xl sm:text-2xl font-bold font-mono">
                Total: {totalResponses}{" "}
                {totalResponses === 1 ? "response" : "responses"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button
          variant="ghost"
          size="xl"
          fullWidth
          onClick={onNextQuestion}
          className="border-4 border-white text-white hover:bg-white hover:text-dark-900 font-display uppercase text-xl sm:text-2xl py-6 sm:py-8 retro-shadow"
        >
          <span className="flex items-center justify-center gap-4">
            <span className="text-3xl sm:text-4xl">▶</span>
            <span>NEXT QUESTION</span>
            <span className="text-3xl sm:text-4xl">◀</span>
          </span>
        </Button>
      </div>
    </Card>
  );
}
