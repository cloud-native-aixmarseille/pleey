import { AnswerResult, Question } from '../../../shared/types';
import { Button, Card } from '../../../shared/components';
import { ShareButton } from './ShareButton';

interface QuestionResultDisplayProps {
  answerResult: AnswerResult;
  currentQuestion: Question;
  questionNumber: number;
  userAnswer: string | null;
  isAdmin: boolean;
  onNextQuestion: () => void;
}

export default function QuestionResultDisplay({
  answerResult,
  currentQuestion,
  questionNumber,
  userAnswer,
  isAdmin,
  onNextQuestion
}: QuestionResultDisplayProps) {
  const isCorrect = answerResult.isCorrect;

  // Calculate percentage for each answer option
  const getPercentage = (option: string) => {
    if (!answerResult.statistics || answerResult.statistics.totalAnswers === 0) {
      return 0;
    }
    const count = answerResult.statistics.answerDistribution[option] || 0;
    return Math.round((count / answerResult.statistics.totalAnswers) * 100);
  };

  // Get color based on option correctness
  const getOptionColor = (option: string) => {
    if (option === answerResult.correctAnswer) {
      return 'from-success-500 to-accent-500';
    }
    if (option === userAnswer && !isCorrect) {
      return 'from-danger-500 to-secondary-500';
    }
    return 'from-light-300 to-light-400';
  };

  // Share result text
  const shareText = `I ${isCorrect ? 'got it right' : 'missed it'} and scored ${answerResult.points} points on question ${questionNumber}! 🎯`;

  return (
    <Card className={`
      p-8 sm:p-12 text-white animate-scale-in relative overflow-hidden
      ${isCorrect 
        ? 'bg-gradient-to-br from-success-500 to-accent-500' 
        : 'bg-gradient-to-br from-danger-500 to-secondary-500'}
    `}>
      {/* Animated background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-float" 
           style={{ animationDuration: '2s' }}></div>

      <div className="relative z-10">
        {/* Result Icon with bounce animation */}
        <div className="text-7xl sm:text-8xl mb-6 animate-bounce-slow text-center">
          {isCorrect ? '🎉' : '😢'}
        </div>

        {/* Result Title */}
        <h3 className="text-4xl sm:text-5xl font-black mb-4 text-center font-display uppercase">
          {isCorrect ? 'BRAVO !' : 'OUPS !'}
        </h3>

        {/* Points or Correct Answer Display */}
        <div className="glass-effect rounded-2xl p-6 mb-8 border-2 border-white/30">
          <p className="text-2xl sm:text-3xl font-bold text-center font-body">
            {isCorrect 
              ? `+${answerResult.points} points` 
              : `Bonne réponse: ${answerResult.correctAnswer}`
            }
          </p>
        </div>

        {/* Answer Statistics - Visual Chart */}
        {answerResult.statistics && answerResult.statistics.totalAnswers > 0 && (
          <div className="mb-8 glass-effect rounded-2xl p-6 border-2 border-white/30 animate-fade-in" 
               style={{ animationDelay: '0.3s' }}>
            <h4 className="text-xl font-bold mb-4 text-center font-display uppercase">
              📊 Answer Distribution
            </h4>
            <div className="space-y-3">
              {currentQuestion.type === 'multiple' ? (
                ['A', 'B', 'C', 'D'].map((option) => {
                  const percentage = getPercentage(option);
                  const isUserAnswer = option === userAnswer;
                  const isCorrectAnswer = option === answerResult.correctAnswer;
                  
                  return (
                    <div key={option} className="relative">
                      <div className="flex items-center justify-between mb-1 text-sm font-mono">
                        <span className="font-bold">
                          {option}. {currentQuestion[`option_${option.toLowerCase()}`]}
                          {isCorrectAnswer && ' ✓'}
                          {isUserAnswer && !isCorrectAnswer && ' ✗'}
                        </span>
                        <span className="font-black">{percentage}%</span>
                      </div>
                      <div className="relative h-8 bg-dark-700/50 rounded-full overflow-hidden border border-white/20">
                        <div
                          className={`h-full bg-gradient-to-r ${getOptionColor(option)} transition-all duration-1000 flex items-center justify-end px-3`}
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${0.1 * ['A', 'B', 'C', 'D'].indexOf(option)}s`
                          }}
                        >
                          {percentage > 10 && (
                            <span className="text-white font-black text-sm drop-shadow-lg">
                              {answerResult.statistics.answerDistribution[option] || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                ['true', 'false'].map((option) => {
                  const percentage = getPercentage(option);
                  const isUserAnswer = option === userAnswer;
                  const isCorrectAnswer = option === answerResult.correctAnswer;
                  
                  return (
                    <div key={option} className="relative">
                      <div className="flex items-center justify-between mb-1 text-sm font-mono">
                        <span className="font-bold uppercase">
                          {option === 'true' ? '✓ VRAI' : '✗ FAUX'}
                          {isCorrectAnswer && ' ✓'}
                          {isUserAnswer && !isCorrectAnswer && ' ✗'}
                        </span>
                        <span className="font-black">{percentage}%</span>
                      </div>
                      <div className="relative h-8 bg-dark-700/50 rounded-full overflow-hidden border border-white/20">
                        <div
                          className={`h-full bg-gradient-to-r ${getOptionColor(option)} transition-all duration-1000 flex items-center justify-end px-3`}
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${option === 'true' ? '0s' : '0.1s'}`
                          }}
                        >
                          {percentage > 10 && (
                            <span className="text-white font-black text-sm drop-shadow-lg">
                              {answerResult.statistics.answerDistribution[option] || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-center text-sm mt-4 text-white/80 font-mono">
              {answerResult.statistics.totalAnswers} {answerResult.statistics.totalAnswers === 1 ? 'réponse' : 'réponses'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Share Button */}
          <ShareButton 
            title="QuizMaster - Question Result"
            text={shareText}
            className="flex-1 w-full sm:w-auto"
          />

          {/* Next Question Button (Admin only) */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="xl"
              onClick={onNextQuestion}
              className="border-2 border-white text-white hover:bg-white hover:text-dark-900 flex-1 w-full sm:w-auto font-display uppercase"
            >
              <span className="flex items-center gap-2">
                <span>Question suivante</span>
                <span className="text-2xl">→</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
