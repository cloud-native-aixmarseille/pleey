import type { AnswerResult } from "../../../../../../../domains/game/types";
import type { Question } from "../../../../../../../domains/quiz/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ResultLayout } from "./components/ResultLayout";
import { ResultHeader } from "./components/ResultHeader";
import { ResultSummary } from "./components/ResultSummary";
import { AnswerDistribution } from "./components/AnswerDistribution";
import { ResultActions } from "./components/ResultActions";

interface QuestionResultDisplayProps {
  answerResult: AnswerResult;
  currentQuestion: Question;
  questionNumber: number;
  userAnswer: string | null;
  isAdmin: boolean;
  onNextQuestion: () => void;
}

export default function QuestionResultDisplay({
  answerResult,
  currentQuestion,
  questionNumber,
  userAnswer,
  isAdmin,
  onNextQuestion,
}: QuestionResultDisplayProps) {
  const { isCorrect, points, correctAnswer, statistics } = answerResult;
  const { t } = useTranslation();

  const shareText = useMemo(() => {
    const resultKey = isCorrect ? "correct" : "incorrect";
    return t("game.playing.result.shareText", {
      result: t(`game.playing.result.shareTextResult.${resultKey}`),
      points,
      question: questionNumber,
    });
  }, [isCorrect, points, questionNumber, t]);

  const announcement = isCorrect
    ? t("game.playing.result.announcementCorrect", { points })
    : t("game.playing.result.announcementIncorrect", {
        answer: correctAnswer,
      });

  const statisticsAnnouncement = statistics
    ? t("game.playing.result.announcementStatistics", {
        count: statistics.totalAnswers,
      })
    : undefined;

  const headerTitle = isCorrect
    ? t("game.playing.result.titleCorrect")
    : t("game.playing.result.titleIncorrect");

  const summary = isCorrect
    ? t("game.playing.result.summaryPoints", { points })
    : t("game.playing.result.summaryCorrectAnswer", {
        answer: correctAnswer,
      });

  return (
    <ResultLayout
      isCorrect={isCorrect}
      announcement={announcement}
      statisticsAnnouncement={statisticsAnnouncement}
    >
      <ResultHeader isCorrect={isCorrect} title={headerTitle} />
      <ResultSummary summary={summary} />
      <AnswerDistribution
        question={currentQuestion}
        answerResult={answerResult}
        userAnswer={userAnswer}
      />
      <ResultActions
        shareTitle={t("game.playing.result.shareTitle")}
        shareText={shareText}
        isAdmin={isAdmin}
        onNextQuestion={onNextQuestion}
        nextQuestionLabel={t("game.playing.result.nextQuestion")}
      />
    </ResultLayout>
  );
}
