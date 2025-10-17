import { Quiz, Question } from '../../../shared/types';

interface ManageQuestionsPageProps {
  quiz: Quiz;
  questions: Question[];
  onAddQuestion: (questionData: Partial<Question>) => Promise<void>;
  onBack: () => void;
}

export default function ManageQuestionsPage({
  quiz,
  questions,
  onAddQuestion,
  onBack
}: ManageQuestionsPageProps) {
  const handleAddQuestion = () => {
    const type = confirm('Type: OK = Choix multiple, Annuler = Vrai/Faux') ? 'multiple' : 'truefalse';
    const question_text = prompt('Question:');
    if (!question_text) return;

    const questionData: any = {
      quiz_id: quiz.id,
      question_text,
      type,
      time_limit: 20,
      points: 1000
    };

    if (type === 'multiple') {
      questionData.option_a = prompt('Option A:');
      questionData.option_b = prompt('Option B:');
      questionData.option_c = prompt('Option C:');
      questionData.option_d = prompt('Option D:');
      questionData.correct_answer = prompt('Réponse correcte (A/B/C/D):');
    } else {
      questionData.correct_answer = confirm('Réponse: OK = Vrai, Annuler = Faux') ? 'true' : 'false';
    }

    onAddQuestion(questionData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-black text-gray-800 mb-2">{quiz.title}</h2>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
          <button
            onClick={handleAddQuestion}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition mb-6"
          >
            + Ajouter une question
          </button>
          <button
            onClick={onBack}
            className="ml-4 bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition mb-6"
          >
            ← Retour
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Q{index + 1}: {q.question_text}
                </h3>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                  {q.type === 'multiple' ? 'QCM' : 'Vrai/Faux'}
                </span>
              </div>
              {q.type === 'multiple' && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-3 rounded-lg ${q.correct_answer === 'A' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    A: {q.option_a}
                  </div>
                  <div className={`p-3 rounded-lg ${q.correct_answer === 'B' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    B: {q.option_b}
                  </div>
                  <div className={`p-3 rounded-lg ${q.correct_answer === 'C' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    C: {q.option_c}
                  </div>
                  <div className={`p-3 rounded-lg ${q.correct_answer === 'D' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    D: {q.option_d}
                  </div>
                </div>
              )}
              {q.type === 'truefalse' && (
                <div className="mb-4">
                  <span className="text-green-600 font-bold">
                    Réponse: {q.correct_answer === 'true' ? '✓ Vrai' : '✗ Faux'}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>⏱️ {q.time_limit}s</span>
                <span>🏆 {q.points} points</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
