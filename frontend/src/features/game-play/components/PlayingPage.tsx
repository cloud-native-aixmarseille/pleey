import { Question, AnswerResult } from '../../../shared/types';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec timer et progression */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold text-gray-600">
              Question {questionNumber} / {totalQuestions}
            </div>
            <div className="text-3xl font-black text-purple-600">
              ⏱️ {timeLeft}s
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Réponses */}
        {!showResult ? (
          currentQuestion.type === 'multiple' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { letter: 'A', text: currentQuestion.option_a, color: 'from-red-500 to-pink-500' },
                { letter: 'B', text: currentQuestion.option_b, color: 'from-blue-500 to-cyan-500' },
                { letter: 'C', text: currentQuestion.option_c, color: 'from-yellow-500 to-orange-500' },
                { letter: 'D', text: currentQuestion.option_d, color: 'from-green-500 to-emerald-500' }
              ].map(option => (
                <button
                  key={option.letter}
                  onClick={() => onSubmitAnswer(option.letter)}
                  disabled={userAnswer !== null}
                  className={`bg-gradient-to-br ${option.color} text-white p-8 rounded-3xl shadow-2xl hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-4xl font-black mb-4">{option.letter}</div>
                  <div className="text-2xl font-bold">{option.text}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => onSubmitAnswer('true')}
                disabled={userAnswer !== null}
                className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-12 rounded-3xl shadow-2xl hover:scale-105 transform transition disabled:opacity-50"
              >
                <div className="text-6xl mb-4">✓</div>
                <div className="text-3xl font-black">VRAI</div>
              </button>
              <button
                onClick={() => onSubmitAnswer('false')}
                disabled={userAnswer !== null}
                className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-12 rounded-3xl shadow-2xl hover:scale-105 transform transition disabled:opacity-50"
              >
                <div className="text-6xl mb-4">✗</div>
                <div className="text-3xl font-black">FAUX</div>
              </button>
            </div>
          )
        ) : answerResult && (
          <div className={`bg-gradient-to-br ${answerResult.isCorrect ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'} rounded-3xl shadow-2xl p-12 text-center text-white`}>
            <div className="text-8xl mb-6">
              {answerResult.isCorrect ? '🎉' : '😢'}
            </div>
            <h3 className="text-5xl font-black mb-4">
              {answerResult.isCorrect ? 'BRAVO !' : 'OUPS !'}
            </h3>
            <p className="text-3xl font-bold mb-6">
              {answerResult.isCorrect 
                ? `+${answerResult.points} points` 
                : `Bonne réponse: ${answerResult.correctAnswer}`
              }
            </p>
            {isAdmin && (
              <button
                onClick={onNextQuestion}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition mt-4"
              >
                Question suivante →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
