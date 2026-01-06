import { useEffect, useState } from "react";
import { socket } from "../../../../infrastructure/socket/socket.client";
import type { AnswerResult, LeaderboardEntry, Player } from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";

export function useGameSocket() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  useEffect(() => {
    socket.on("player-joined", (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    socket.on(
      "game-started",
      (data: {
        question: Question;
        questionNumber: number;
        totalQuestions: number;
      }) => {
        setCurrentQuestion(data.question);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
        setTimeLeft(data.question.time_limit);
        setGameStarted(true);
        setAnswerSubmitted(false);
      },
    );

    socket.on("answer-submitted", () => {
      setAnswerSubmitted(true);
    });

    socket.on("answer-result", (data: AnswerResult) => {
      setAnswerResult(data);
      setShowResult(true);
    });

    socket.on(
      "next-question",
      (data: { question: Question; questionNumber: number }) => {
        setCurrentQuestion(data.question);
        setQuestionNumber(data.questionNumber);
        setTimeLeft(data.question.time_limit);
        setShowResult(false);
        setAnswerResult(null);
        setAnswerSubmitted(false);
      },
    );

    socket.on("game-ended", (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
      setGameEnded(true);
    });

    return () => {
      socket.off("player-joined");
      socket.off("game-started");
      socket.off("answer-submitted");
      socket.off("answer-result");
      socket.off("next-question");
      socket.off("game-ended");
    };
  }, []);

  return {
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
    gameEnded,
    answerSubmitted,
  };
}
