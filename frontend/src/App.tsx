import { useState } from 'react';
import { User, Quiz, Question } from './shared/types';
import { authService } from './domains/auth/auth.service';
import { quizService } from './domains/quiz/quiz.service';
import { gameService } from './domains/game/game.service';
import { useGameSocket } from './shared/hooks/useGameSocket';
import { useTimer } from './shared/hooks/useTimer';

// Feature Components
import HomePage from './features/home/components/HomePage';
import LoginPage from './features/authentication/components/LoginPage';
import RegisterPage from './features/authentication/components/RegisterPage';
import AdminDashboard from './features/quiz-management/components/AdminDashboard';
import ManageQuestionsPage from './features/quiz-management/components/ManageQuestionsPage';
import JoinGamePage from './features/game-play/components/JoinGamePage';
import LobbyPage from './features/game-play/components/LobbyPage';
import PlayingPage from './features/game-play/components/PlayingPage';
import LeaderboardPage from './features/game-play/components/LeaderboardPage';

export default function QuizApp() {
  // Navigation state
  const [view, setView] = useState('home');
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Quiz management state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Game state
  const [gamePin, setGamePin] = useState('');
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  
  // Socket state
  const {
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    setTimeLeft,
    answerResult,
    showResult,
    leaderboard,
    gameStarted,
    gameEnded
  } = useGameSocket();
  
  // Timer effect
  useTimer(timeLeft, setTimeLeft, !!currentQuestion, !!userAnswer);
  
  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        if (data.user.isAdmin) {
          setView('admin');
          await loadQuizzes(data.token);
        } else {
          setView('join');
        }
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };
  
  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await authService.register(username, email, password);
      alert('Inscription réussie ! Connectez-vous.');
      setView('login');
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    }
  };
  
  // Quiz management handlers
  const loadQuizzes = async (authToken: string) => {
    const data = await quizService.getQuizzes(authToken);
    setQuizzes(data);
  };
  
  const handleCreateQuiz = async (title: string, description: string) => {
    if (!token) return;
    await quizService.createQuiz(token, title, description);
    await loadQuizzes(token);
  };
  
  const handleManageQuiz = async (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    if (token) {
      const data = await quizService.getQuestions(token, quiz.id);
      setQuestions(data);
    }
    setView('manage-questions');
  };
  
  const handleAddQuestion = async (questionData: Partial<Question>) => {
    if (!token) return;
    await quizService.addQuestion(token, questionData);
    if (currentQuiz) {
      const data = await quizService.getQuestions(token, currentQuiz.id);
      setQuestions(data);
    }
  };
  
  // Game handlers
  const handleLaunchQuiz = async (quizId: number) => {
    if (!token || !user) return;
    const data = await gameService.createSession(token, quizId);
    setGamePin(data.pin);
    setView('lobby');
    gameService.joinGame(data.pin, user.username, user.id);
  };
  
  const handleJoinGame = () => {
    if (!user) return;
    gameService.joinGame(gamePin, user.username, user.id);
    setView('lobby');
  };
  
  const handleStartGame = () => {
    gameService.startGame(gamePin);
  };
  
  const handleSubmitAnswer = (answer: string) => {
    if (!user) return;
    setUserAnswer(answer);
    gameService.submitAnswer(gamePin, user.id, answer, timeLeft);
  };
  
  const handleNextQuestion = () => {
    gameService.nextQuestion(gamePin);
    setUserAnswer(null);
  };
  
  // Navigation effects
  if (gameStarted && view === 'lobby') {
    setView('playing');
  }
  
  if (gameEnded && view === 'playing') {
    setView('leaderboard');
  }
  
  // Route rendering
  if (view === 'home') {
    return <HomePage onNavigate={setView} />;
  }
  
  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigate={setView} />;
  }
  
  if (view === 'register') {
    return <RegisterPage onRegister={handleRegister} onNavigate={setView} />;
  }
  
  if (view === 'admin') {
    return (
      <AdminDashboard
        quizzes={quizzes}
        onCreateQuiz={handleCreateQuiz}
        onManageQuiz={handleManageQuiz}
        onLaunchQuiz={handleLaunchQuiz}
      />
    );
  }
  
  if (view === 'manage-questions' && currentQuiz) {
    return (
      <ManageQuestionsPage
        quiz={currentQuiz}
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onBack={() => setView('admin')}
      />
    );
  }
  
  if (view === 'join') {
    return (
      <JoinGamePage
        gamePin={gamePin}
        onGamePinChange={setGamePin}
        onJoinGame={handleJoinGame}
        onNavigate={setView}
      />
    );
  }
  
  if (view === 'lobby') {
    return (
      <LobbyPage
        gamePin={gamePin}
        players={players}
        isAdmin={user?.isAdmin || false}
        onStartGame={handleStartGame}
      />
    );
  }
  
  if (view === 'playing' && currentQuestion) {
    return (
      <PlayingPage
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        userAnswer={userAnswer}
        showResult={showResult}
        answerResult={answerResult}
        isAdmin={user?.isAdmin || false}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
      />
    );
  }
  
  if (view === 'leaderboard') {
    return <LeaderboardPage leaderboard={leaderboard} onNavigate={setView} />;
  }
  
  return null;
}
