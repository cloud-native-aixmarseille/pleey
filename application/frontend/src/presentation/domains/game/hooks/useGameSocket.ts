import { useEffect, useState } from "react";
import {
  offGameSocketEvent,
  GAME_SOCKET_INBOUND_EVENT,
  onGameSocketEvent,
} from "../../../../infrastructure/game/game-socket-events";
import type { AnswerResult, LeaderboardEntry, Player } from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";

function normalizePin(pin?: string) {
  return (pin ?? "").trim().toUpperCase();
}

export function useGameSocket(pin = "") {
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
  const [isPaused, setIsPaused] = useState(false);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);

  useEffect(() => {
    const normalizedPin = normalizePin(pin);
    if (!normalizedPin) {
      return;
    }

    setPlayers([]);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setTimeLeft(20);
    setAnswerResult(null);
    setShowResult(false);
    setLeaderboard([]);
    setGameStarted(false);
    setGameEnded(false);
    setAnswerSubmitted(false);
    setIsPaused(false);
    setLastErrorCode(null);
  }, [pin]);

  useEffect(() => {
    const handleError = (data: { message?: string }) => {
      if (typeof data?.message === "string" && data.message.trim()) {
        setLastErrorCode(data.message);
      }
    };

    const handlePlayerJoined = (data: { players: Player[] }) => {
      setPlayers(data.players);
    };

    const handleGameStarted = (data: {
      question: Question;
      totalQuestions: number;
    }) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question.position + 1);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.question.timeLimit);
      setGameStarted(true);
      setAnswerSubmitted(false);
    };

    const handleGameResumed = (data: {
      question: Question;
      totalQuestions: number;
      timeLeft?: number;
    }) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question.position + 1);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLeft ?? data.question.timeLimit);
      setGameStarted(true);
      setIsPaused(false);
    };

    const handleGamePaused = (data: { timeLeft?: number }) => {
      if (typeof data.timeLeft === "number") {
        setTimeLeft(data.timeLeft);
      }
      setIsPaused(true);
    };

    const handleAnswerSubmitted = () => {
      setAnswerSubmitted(true);
    };

    const handleAnswerResult = (data: AnswerResult) => {
      setAnswerResult(data);
      setShowResult(true);
      setTimeLeft(0);
    };

    const handleNextQuestion = (data: {
      question: Question;
    }) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question.position + 1);
      setTimeLeft(data.question.timeLimit);
      setShowResult(false);
      setAnswerResult(null);
      setAnswerSubmitted(false);
    };

    const handleGameEnded = (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
      setGameEnded(true);
    };

    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ERROR, handleError);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.PLAYER_JOINED, handlePlayerJoined);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_STARTED, handleGameStarted);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_RESUMED, handleGameResumed);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_PAUSED, handleGamePaused);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ANSWER_SUBMITTED, handleAnswerSubmitted);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ANSWER_RESULT, handleAnswerResult);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.NEXT_QUESTION, handleNextQuestion);
    onGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_ENDED, handleGameEnded);

    return () => {
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ERROR, handleError);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.PLAYER_JOINED, handlePlayerJoined);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_STARTED, handleGameStarted);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_RESUMED, handleGameResumed);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_PAUSED, handleGamePaused);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ANSWER_SUBMITTED, handleAnswerSubmitted);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.ANSWER_RESULT, handleAnswerResult);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.NEXT_QUESTION, handleNextQuestion);
      offGameSocketEvent(GAME_SOCKET_INBOUND_EVENT.GAME_ENDED, handleGameEnded);
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
    isPaused,
    lastErrorCode,
  };
}
