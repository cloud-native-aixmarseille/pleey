import { Question, AnswerResult } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';
import { useState, useEffect } from 'react';

interface AdminHostPlayingViewProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  showResult: boolean;
  answerResult: AnswerResult | null;
  onNextQuestion: () => void;
}

export default function AdminHostPlayingView({
  currentQuestion,
  questionNumber,
  totalQuestions,
  timeLeft,
  showResult,
  answerResult,
  onNextQuestion
}: AdminHostPlayingViewProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const progressPercent = (timeLeft / currentQuestion.time_limit) * 100;
  const isLowTime = timeLeft <= 5;
  const isMediumTime = timeLeft > 5 && timeLeft <= 10;

  useEffect(() => {
    if (isLowTime) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isLowTime]);

  // Calculate percentage for each answer option
  const getPercentage = (option: string) => {
    if (!answerResult?.statistics || answerResult.statistics.totalAnswers === 0) {
      return 0;
    }
    const count = answerResult.statistics.answerDistribution[option] || 0;
    return Math.round((count / answerResult.statistics.totalAnswers) * 100);
  };

  // Get color based on option correctness
  const getOptionColor = (option: string) => {
    if (option === answerResult?.correctAnswer) {
      return 'from-success-500 to-accent-500';
    }
    return 'from-primary-500 to-secondary-500';
  };

  return (
    <div className="min-h-screen bg-game-gradient crt-screen p-4 sm:p-6 relative overflow-hidden">
      {/* Enhanced animated background for screen sharing visibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
      </div>

      <Container size="xl" className="relative z-10">
        {/* Admin Host Badge */}
        <div className="mb-4 flex justify-center">
          <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
            <span className="text-3xl animate-bounce-slow">👑</span>
            <span className="font-display text-accent-400 uppercase text-lg tracking-wider">
              HOST VIEW - SCREEN SHARE MODE
            </span>
          </div>
        </div>

        {/* Header with enhanced timer and progress */}
        <Card className="p-6 sm:p-8 mb-6 sm:mb-8 animate-slide-down border-4 border-primary-500/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-4">
            {/* Question Counter - Extra Large for visibility */}
            <div className="glass-effect rounded-2xl px-6 py-4 border-2 border-accent-500/50">
              <div className="text-center">
                <div className="font-display text-accent-500 text-sm mb-1 uppercase tracking-wider">
                  Question
                </div>
                <div className="font-display text-white font-bold text-3xl sm:text-4xl">
                  {questionNumber} / {totalQuestions}
                </div>
              </div>
            </div>

            {/* Timer Display - Prominent and Animated */}
            <div className={`
              flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4
              ${isLowTime 
                ? 'bg-danger-500/30 text-danger-400 border-danger-500 animate-pulse shadow-neon-danger' 
                : isMediumTime 
                ? 'bg-secondary-500/30 text-secondary-400 border-secondary-500 shadow-neon-secondary' 
                : 'bg-success-500/30 text-success-400 border-success-500 shadow-neon-accent'}
              ${pulseAnimation ? 'scale-110' : 'scale-100'}
              transition-all duration-300
            `}>
              <span className="text-5xl sm:text-6xl">⏱️</span>
              <div className="text-center">
                <div className="font-display text-6xl sm:text-7xl tracking-wider">
                  {timeLeft}
                </div>
                <div className="font-mono text-sm uppercase tracking-wider opacity-80">
                  seconds
                </div>
              </div>
            </div>

            {/* Players Answering Indicator */}
            {!showResult && answerResult?.statistics && (
              <div className="glass-effect rounded-2xl px-6 py-4 border-2 border-primary-500/50">
                <div className="text-center">
                  <div className="font-display text-primary-500 text-sm mb-1 uppercase tracking-wider">
                    Answered
                  </div>
                  <div className="font-display text-white font-bold text-3xl sm:text-4xl">
                    {answerResult.statistics.totalAnswers}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Progress bar */}
          <div className="relative w-full bg-dark-700 rounded-full h-8 overflow-hidden border-4 border-dark-600 shadow-inner">
            <div
              className={`
                h-full transition-all duration-1000 relative overflow-hidden
                ${isLowTime 
                  ? 'bg-gradient-to-r from-danger-600 to-danger-400 animate-pulse' 
                  : isMediumTime 
                  ? 'bg-gradient-to-r from-secondary-600 to-secondary-400' 
                  : 'bg-gradient-to-r from-success-600 to-accent-500'}
              `}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float"></div>
            </div>
          </div>
        </Card>

        {/* Question Display - Extra Large and Clear */}
        <Card className="p-10 sm:p-16 mb-6 sm:mb-8 text-center animate-scale-in bg-gradient-to-br from-white to-light-100 border-4 border-accent-500/50 shadow-neon-accent">
          <div className="mb-6">
            <div className="inline-block glass-effect rounded-xl px-6 py-2 border-2 border-primary-500/30 mb-4">
              <p className="font-display text-primary-600 text-sm sm:text-base uppercase tracking-wider">
                {currentQuestion.type === 'multiple' ? '📋 Multiple Choice' : '✓/✗ True or False'}
              </p>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-dark-900 leading-tight font-display uppercase">
            {currentQuestion.question_text}
          </h2>
        </Card>

        {/* Answer Options Display (Not Interactive for Admin) */}
        {!showResult ? (
          <div>
            <div className="text-center mb-6">
              <p className="font-display text-accent-500 text-xl sm:text-2xl uppercase tracking-wider animate-pulse-slow">
                ⏳ Waiting for players to answer...
              </p>
            </div>

            {currentQuestion.type === 'multiple' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-80">
                {[
                  { letter: 'A', text: currentQuestion.option_a, className: 'answer-option-a' },
                  { letter: 'B', text: currentQuestion.option_b, className: 'answer-option-b' },
                  { letter: 'C', text: currentQuestion.option_c, className: 'answer-option-c' },
                  { letter: 'D', text: currentQuestion.option_d, className: 'answer-option-d' }
                ].map((option, index) => (
                  <div
                    key={option.letter}
                    className={`
                      ${option.className}
                      text-white p-8 sm:p-10 rounded-3xl shadow-float
                      border-4 border-white/30
                      animate-scale-in
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-5xl sm:text-6xl font-black">{option.letter}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{option.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-80">
                <div className="bg-gradient-to-br from-success-500 to-accent-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in">
                  <div className="text-8xl sm:text-9xl mb-6 text-center">✓</div>
                  <div className="text-4xl sm:text-5xl font-black text-center font-display uppercase">VRAI</div>
                </div>
                <div className="bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in animation-delay-100">
                  <div className="text-8xl sm:text-9xl mb-6 text-center">✗</div>
                  <div className="text-4xl sm:text-5xl font-black text-center font-display uppercase">FAUX</div>
                </div>
              </div>
            )}
          </div>
        ) : answerResult && (
          /* Results View with Statistics */
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-accent-500 to-primary-600 text-white animate-scale-in border-4 border-accent-400">
            <div className="text-center mb-8">
              <div className="text-8xl sm:text-9xl mb-4 animate-bounce-slow">🎯</div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 font-display uppercase animate-glow">
                RESULTS
              </h3>
              <div className="inline-block glass-effect rounded-2xl px-8 py-4 border-2 border-white/50">
                <p className="text-3xl sm:text-4xl font-bold font-body">
                  Correct Answer: <span className="text-success-200">{answerResult.correctAnswer}</span>
                </p>
              </div>
            </div>

            {/* Answer Statistics - Enhanced for Screen Sharing */}
            {answerResult.statistics && answerResult.statistics.totalAnswers > 0 && (
              <div className="glass-effect rounded-2xl p-8 border-4 border-white/30 animate-fade-in">
                <h4 className="text-2xl sm:text-3xl font-bold mb-6 text-center font-display uppercase">
                  📊 Player Responses
                </h4>
                <div className="space-y-4">
                  {currentQuestion.type === 'multiple' ? (
                    ['A', 'B', 'C', 'D'].map((option) => {
                      const percentage = getPercentage(option);
                      const isCorrectAnswer = option === answerResult.correctAnswer;
                      const count = answerResult.statistics.answerDistribution[option] || 0;
                      
                      return (
                        <div key={option} className="relative">
                          <div className="flex items-center justify-between mb-2 text-lg sm:text-xl font-mono">
                            <span className="font-bold flex items-center gap-2">
                              <span className="text-2xl">{option}.</span>
                              <span>{currentQuestion[`option_${option.toLowerCase()}`]}</span>
                              {isCorrectAnswer && <span className="text-3xl">✓</span>}
                            </span>
                            <span className="font-black text-2xl sm:text-3xl">{percentage}%</span>
                          </div>
                          <div className="relative h-12 sm:h-16 bg-dark-700/50 rounded-2xl overflow-hidden border-2 border-white/30">
                            <div
                              className={`h-full bg-gradient-to-r ${getOptionColor(option)} transition-all duration-1000 flex items-center justify-end px-4 sm:px-6`}
                              style={{ 
                                width: `${percentage}%`,
                                animationDelay: `${0.1 * ['A', 'B', 'C', 'D'].indexOf(option)}s`
                              }}
                            >
                              {percentage > 5 && (
                                <span className="text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                                  {count} player{count !== 1 ? 's' : ''}
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
                      const isCorrectAnswer = option === answerResult.correctAnswer;
                      const count = answerResult.statistics.answerDistribution[option] || 0;
                      
                      return (
                        <div key={option} className="relative">
                          <div className="flex items-center justify-between mb-2 text-lg sm:text-xl font-mono">
                            <span className="font-bold uppercase flex items-center gap-2">
                              <span className="text-2xl">{option === 'true' ? '✓' : '✗'}</span>
                              <span>{option === 'true' ? 'VRAI' : 'FAUX'}</span>
                              {isCorrectAnswer && <span className="text-3xl">✓</span>}
                            </span>
                            <span className="font-black text-2xl sm:text-3xl">{percentage}%</span>
                          </div>
                          <div className="relative h-12 sm:h-16 bg-dark-700/50 rounded-2xl overflow-hidden border-2 border-white/30">
                            <div
                              className={`h-full bg-gradient-to-r ${getOptionColor(option)} transition-all duration-1000 flex items-center justify-end px-4 sm:px-6`}
                              style={{ 
                                width: `${percentage}%`,
                                animationDelay: `${option === 'true' ? '0s' : '0.1s'}`
                              }}
                            >
                              {percentage > 5 && (
                                <span className="text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                                  {count} player{count !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="text-center mt-6">
                  <div className="inline-block glass-effect rounded-xl px-6 py-3 border-2 border-white/30">
                    <p className="text-xl sm:text-2xl font-bold font-mono">
                      Total: {answerResult.statistics.totalAnswers} {answerResult.statistics.totalAnswers === 1 ? 'response' : 'responses'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Question Button - Prominent for Admin */}
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
        )}
      </Container>
    </div>
  );
}
