interface HomePageProps {
  onNavigate: (view: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
          🎮 QuizMaster
        </h1>
        <p className="text-gray-600 mb-8">Apprenez en vous amusant !</p>
        <div className="space-y-4">
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            Se connecter
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="w-full bg-white border-4 border-purple-600 text-purple-600 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}
