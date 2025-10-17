import { Quiz } from '../../../shared/types';

interface AdminDashboardProps {
  quizzes: Quiz[];
  onCreateQuiz: (title: string, description: string) => Promise<void>;
  onManageQuiz: (quiz: Quiz) => void;
  onLaunchQuiz: (quizId: number) => Promise<void>;
}

export default function AdminDashboard({
  quizzes,
  onCreateQuiz,
  onManageQuiz,
  onLaunchQuiz
}: AdminDashboardProps) {
  const handleCreateQuiz = () => {
    const title = prompt('Titre du quiz:');
    const description = prompt('Description:');
    if (title) onCreateQuiz(title, description || '');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-black text-gray-800 mb-6">👑 Panneau Admin</h2>
          <button
            onClick={handleCreateQuiz}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
          >
            + Créer un quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onManageQuiz(quiz)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Gérer
                </button>
                <button
                  onClick={() => onLaunchQuiz(quiz.id)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Lancer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
