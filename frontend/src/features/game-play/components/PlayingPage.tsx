import { Question, AnswerResult } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';
import QuestionResultDisplay from './QuestionResultDisplay';

interface PlayingPageProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  userAnswer: string | null;
  showResult: boolean;
  answerResult: AnswerResult | null;
  isAdmin: boolean;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
}

export default function PlayingPage({
  currentQuestion,
  questionNumber,
  totalQuestions,
  timeLeft,
  userAnswer,
  showResult,
  answerResult,
  isAdmin,
  onSubmitAnswer,
  onNextQuestion
}: PlayingPageProps) {
  const progressPercent = (timeLeft / currentQuestion.time_limit) * 100;
  const isLowTime = timeLeft <= 5;
  const isMediumTime = timeLeft > 5 && timeLeft <= 10;

  return (
    <div className="min-h-screen bg-game-gradient p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
      </div>

      <Container size="xl" className="relative z-10">
        {/* Header with timer and progress */}
        <Card className="p-6 mb-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="glass-effect rounded-2xl px-4 py-2 border border-white/20" role="status" aria-live="polite">
                <span className="text-white font-bold text-lg">
                  Question {questionNumber} / {totalQuestions}
                </span>
              </div>
            </div>
            <div 
              className={`
                flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-3xl
                ${isLowTime ? 'bg-danger-500/20 text-danger-400 animate-pulse' : 
                  isMediumTime ? 'bg-secondary-500/20 text-secondary-400' : 
                  'bg-success-500/20 text-success-400'}
              `}
              role="timer"
              aria-live="assertive"
              aria-atomic="true"
              aria-label={`Time remaining: ${timeLeft} seconds`}
            >
              <span className="text-4xl" aria-hidden="true">⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div 
            className="relative w-full bg-dark-700 rounded-full h-5 overflow-hidden border-2 border-dark-600"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Question time progress`}
          >
            <div
              className={`
                h-full transition-all duration-1000 relative overflow-hidden
                ${isLowTime ? 'bg-gradient-to-r from-danger-500 to-danger-400 animate-pulse' : 
                  isMediumTime ? 'bg-gradient-to-r from-secondary-500 to-secondary-400' : 
                  'bg-gradient-to-r from-success-500 to-accent-500'}
              `}
              style={{ width: `${progressPercent}%` }}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float"></div>
            </div>
          </div>
        </Card>

        {/* Question */}
        <Card className="p-8 sm:p-12 mb-6 text-center animate-scale-in bg-gradient-to-br from-white to-light-100">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 leading-tight">
            {currentQuestion.question_text}
          </h2>
        </Card>

        {/* Answers */}
        {!showResult ? (
          currentQuestion.type === 'multiple' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { letter: 'A', text: currentQuestion.option_a, className: 'answer-option-a' },
                { letter: 'B', text: currentQuestion.option_b, className: 'answer-option-b' },
                { letter: 'C', text: currentQuestion.option_c, className: 'answer-option-c' },
                { letter: 'D', text: currentQuestion.option_d, className: 'answer-option-d' }
              ].map((option, index) => (
                <button
                  key={option.letter}
                  onClick={() => onSubmitAnswer(option.letter)}
                  disabled={userAnswer !== null}
                  className={`
                    ${option.className}
                    text-white p-6 sm:p-8 rounded-3xl shadow-float
                    hover:shadow-float-lg hover:scale-105 transform transition-all duration-300
                    disabled:opacity-60 disabled:cursor-not-allowed
                    animate-scale-in
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-black">{option.letter}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xl sm:text-2xl font-bold">{option.text}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => onSubmitAnswer('true')}
                disabled={userAnswer !== null}
                className="bg-gradient-to-br from-success-500 to-accent-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in"
              >
                <div className="text-7xl sm:text-8xl mb-4">✓</div>
                <div className="text-3xl sm:text-4xl font-black">VRAI</div>
              </button>
              <button
                onClick={() => onSubmitAnswer('false')}
                disabled={userAnswer !== null}
                className="bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in animation-delay-100"
              >
                <div className="text-7xl sm:text-8xl mb-4">✗</div>
                <div className="text-3xl sm:text-4xl font-black">FAUX</div>
              </button>
            </div>
          )
        ) : answerResult && (
          <QuestionResultDisplay
            answerResult={answerResult}
            currentQuestion={currentQuestion}
            questionNumber={questionNumber}
            userAnswer={userAnswer}
            isAdmin={isAdmin}
            onNextQuestion={onNextQuestion}
          />
        )}
      </Container>
    </div>
  );
}
