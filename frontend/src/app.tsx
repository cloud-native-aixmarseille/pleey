import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL);

export default function QuizApp() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gamePin, setGamePin] = useState('');
  const [gameSession, setGameSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [players, setPlayers] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playMusic, setPlayMusic] = useState(true);

  useEffect(() => {
    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('game-started', (data) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.question.time_limit);
      setView('playing');
    });

    socket.on('answer-result', (data) => {
      setAnswerResult(data);
      setShowResult(true);
    });

    socket.on('next-question', (data) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTimeLeft(data.question.time_limit);
      setUserAnswer(null);
      setShowResult(false);
      setAnswerResult(null);
    });

    socket.on('game-ended', (data) => {
      setLeaderboard(data.leaderboard);
      setView('leaderboard');
    });

    return () => {
      socket.off('player-joined');
      socket.off('game-started');
      socket.off('answer-result');
      socket.off('next-question');
      socket.off('game-ended');
    };
  }, []);

  useEffect(() => {
    if (currentQuestion && timeLeft > 0 && !userAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentQuestion, userAnswer]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        if (data.user.isAdmin) {
          setView('admin');
          loadQuizzes(data.token);
        } else {
          setView('join');
        }
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (response.ok) {
        alert('Inscription réussie ! Connectez-vous.');
        setView('login');
      }
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    }
  };

  const loadQuizzes = async (authToken) => {
    const response = await fetch(`${API_URL}/api/quizzes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    setQuizzes(data);
  };

  const createQuiz = async (title, description) => {
    const response = await fetch(`${API_URL}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });
    const data = await response.json();
    loadQuizzes(token);
    return data;
  };

  const loadQuestions = async (quizId) => {
    const response = await fetch(`${API_URL}/api/quizzes/${quizId}/questions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setQuestions(data);
  };

  const addQuestion = async (questionData) => {
    await fetch(`${API_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(questionData)
    });
    loadQuestions(questionData.quiz_id);
  };

  const createGameSession = async (quizId) => {
    const response = await fetch(`${API_URL}/api/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quizId })
    });
    const data = await response.json();
    setGamePin(data.pin);
    setView('lobby');
    socket.emit('join-game', { pin: data.pin, username: user.username, userId: user.id });
  };

  const joinGame = () => {
    socket.emit('join-game', { pin: gamePin, username: user.username, userId: user.id });
    setView('lobby');
  };

  const startGame = () => {
    socket.emit('start-game', { pin: gamePin });
  };

  const submitAnswer = (answer) => {
    setUserAnswer(answer);
    socket.emit('submit-answer', {
      pin: gamePin,
      userId: user.id,
      answer,
      timeLeft
    });
  };

  const nextQuestion = () => {
    socket.emit('next-question', { pin: gamePin });
  };

  // Vue Home
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        {playMusic && <audio src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_2e8c9f3f58.mp3" autoPlay loop />}
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
            🎮 QuizMaster
          </h1>
          <p className="text-gray-600 mb-8">Apprenez en vous amusant !</p>
          <div className="space-y-4">
            <button
              onClick={() => setView('login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              Se connecter
            </button>
            <button
              onClick={() => setView('register')}
              className="w-full bg-white border-4 border-purple-600 text-purple-600 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              S'inscrire
            </button>
          </div>
          <button
            onClick={() => setPlayMusic(!playMusic)}
            className="mt-6 text-gray-500 hover:text-purple-600"
          >
            {playMusic ? '🔊 Musique ON' : '🔇 Musique OFF'}
          </button>
        </div>
      </div>
    );
  }

  // Vue Login
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-black text-gray-800 mb-6">Connexion</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            login(e.target.email.value, e.target.password.value);
          }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-purple-600 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 focus:border-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Se connecter
            </button>
          </form>
          <button
            onClick={() => setView('home')}
            className="w-full mt-4 text-gray-600 hover:text-purple-600"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // Vue Register
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-black text-gray-800 mb-6">Inscription</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            register(e.target.username.value, e.target.email.value, e.target.password.value);
          }}>
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-green-600 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-green-600 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 focus:border-green-600 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition"
            >
              S'inscrire
            </button>
          </form>
          <button
            onClick={() => setView('home')}
            className="w-full mt-4 text-gray-600 hover:text-green-600"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // Vue Admin
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-black text-gray-800 mb-6">👑 Panneau Admin</h2>
            <button
              onClick={() => {
                const title = prompt('Titre du quiz:');
                const description = prompt('Description:');
                if (title) createQuiz(title, description);
              }}
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
                    onClick={() => {
                      setCurrentQuiz(quiz);
                      loadQuestions(quiz.id);
                      setView('manage-questions');
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Gérer
                  </button>
                  <button
                    onClick={() => createGameSession(quiz.id)}
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

  // Vue Manage Questions
  if (view === 'manage-questions') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-black text-gray-800 mb-2">{currentQuiz.title}</h2>
            <p className="text-gray-600 mb-6">{currentQuiz.description}</p>
            <button
              onClick={() => {
                const type = confirm('Type: OK = Choix multiple, Annuler = Vrai/Faux') ? 'multiple' : 'truefalse';
                const question_text = prompt('Question:');
                if (!question_text) return;

                let questionData = {
                  quiz_id: currentQuiz.id,
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

                addQuestion(questionData);
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition mb-6"
            >
              + Ajouter une question
            </button>
            <button
              onClick={() => setView('admin')}
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

  // Vue Join
  if (view === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-4xl font-black text-gray-800 mb-8">Rejoindre une partie</h2>
          <input
            type="text"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            placeholder="Entrer le code PIN"
            className="w-full p-6 border-4 border-gray-300 rounded-xl mb-6 text-center text-3xl font-bold focus:border-orange-500 focus:outline-none"
            maxLength="6"
          />
          <button
            onClick={joinGame}
            disabled={gamePin.length !== 6}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rejoindre
          </button>
          <button
            onClick={() => setView('home')}
            className="w-full mt-4 text-gray-600 hover:text-orange-600"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // Vue Lobby
  if (view === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Code PIN
            </h2>
            <div className="text-7xl font-black text-gray-800 mb-8 tracking-wider">
              {gamePin}
            </div>
            <div className="text-2xl font-bold text-gray-600 mb-8">
              {players.length} joueur{players.length > 1 ? 's' : ''} connecté{players.length > 1 ? 's' : ''}
            </div>
            {user?.isAdmin && (
              <button
                onClick={startGame}
                disabled={players.length < 1}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50"
              >
                🚀 Démarrer la partie
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition"
              >
                <div className="text-4xl mb-2">
                  {['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐷'][index % 8]}
                </div>
                <div className="font-bold text-gray-800 truncate">
                  {player.username}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vue Playing
  if (view === 'playing' && currentQuestion) {
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
                    onClick={() => submitAnswer(option.letter)}
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
                  onClick={() => submitAnswer('true')}
                  disabled={userAnswer !== null}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-12 rounded-3xl shadow-2xl hover:scale-105 transform transition disabled:opacity-50"
                >
                  <div className="text-6xl mb-4">✓</div>
                  <div className="text-3xl font-black">VRAI</div>
                </button>
                <button
                  onClick={() => submitAnswer('false')}
                  disabled={userAnswer !== null}
                  className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-12 rounded-3xl shadow-2xl hover:scale-105 transform transition disabled:opacity-50"
                >
                  <div className="text-6xl mb-4">✗</div>
                  <div className="text-3xl font-black">FAUX</div>
                </button>
              </div>
            )
          ) : (
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
              {user?.isAdmin && (
                <button
                  onClick={nextQuestion}
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

  // Vue Leaderboard
  if (view === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
              🏆 CLASSEMENT FINAL 🏆
            </h2>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* 2ème place */}
            {leaderboard[1] && (
              <div className="text-center">
                <div className="bg-gray-300 rounded-t-3xl p-6 shadow-2xl">
                  <div className="text-6xl mb-2">🥈</div>
                  <div className="text-2xl font-black text-gray-800">{leaderboard[1].username}</div>
                  <div className="text-xl font-bold text-gray-600">{leaderboard[1].score} pts</div>
                </div>
                <div className="bg-gray-400 h-32 rounded-b-2xl flex items-center justify-center">
                  <span className="text-6xl font-black text-white">2</span>
                </div>
              </div>
            )}

            {/* 1ère place */}
            {leaderboard[0] && (
              <div className="text-center">
                <div className="bg-yellow-300 rounded-t-3xl p-8 shadow-2xl transform scale-110">
                  <div className="text-8xl mb-2">👑</div>
                  <div className="text-3xl font-black text-gray-800">{leaderboard[0].username}</div>
                  <div className="text-2xl font-bold text-gray-600">{leaderboard[0].score} pts</div>
                </div>
                <div className="bg-yellow-400 h-48 rounded-b-2xl flex items-center justify-center">
                  <span className="text-8xl font-black text-white">1</span>
                </div>
              </div>
            )}

            {/* 3ème place */}
            {leaderboard[2] && (
              <div className="text-center">
                <div className="bg-orange-300 rounded-t-3xl p-6 shadow-2xl">
                  <div className="text-6xl mb-2">🥉</div>
                  <div className="text-2xl font-black text-gray-800">{leaderboard[2].username}</div>
                  <div className="text-xl font-bold text-gray-600">{leaderboard[2].score} pts</div>
                </div>
                <div className="bg-orange-400 h-24 rounded-b-2xl flex items-center justify-center">
                  <span className="text-6xl font-black text-white">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Reste du classement */}
          {leaderboard.slice(3).map((player, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-gray-400">#{index + 4}</span>
                <span className="text-2xl font-bold text-gray-800">{player.username}</span>
              </div>
              <span className="text-2xl font-black text-purple-600">{player.score} pts</span>
            </div>
          ))}

          <button
            onClick={() => {
              setView(user?.isAdmin ? 'admin' : 'join');
              setLeaderboard([]);
              setGamePin('');
            }}
            className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition mt-8"
          >
            Nouvelle partie
          </button>
        </div>
      </div>
    );
  }

  return null;
}