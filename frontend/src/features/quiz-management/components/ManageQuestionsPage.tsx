import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Quiz, Question } from "../../../shared/types";
import { Button, Card, Container } from "../../../shared/components";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../domains/quiz/quiz.service";

interface ManageQuestionsPageProps {
  quiz: Quiz;
  questions: Question[];
  onAddQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
  onDeleteQuestion: (questionId: number) => Promise<void>;
  onUpdateQuestion: (
    questionId: number,
    payload: UpdateQuestionPayload
  ) => Promise<unknown>;
}

export default function ManageQuestionsPage({
  quiz,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
}: ManageQuestionsPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const promptOptionalText = (key: string, current?: string | null) => {
    const value = prompt(t(key), current ?? undefined);
    if (value === null) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  };

  const promptOptionalNumber = (key: string, current: number) => {
    const value = prompt(t(key), String(current));
    if (value === null) {
      return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return undefined;
    }

    return parsed;
  };

  const handleAddQuestion = () => {
    const type = confirm(t("quiz.confirmQuestionType"))
      ? "multiple"
      : "truefalse";
    const question_text = prompt(t("quiz.promptQuestion"));
    if (!question_text) return;

    const payload: CreateQuestionPayload = {
      quizId: quiz.id,
      questionText: question_text,
      type,
      timeLimit: 20,
      points: 1000,
      correctAnswer: "",
    };

    if (type === "multiple") {
      payload.optionA = promptOptionalText("quiz.promptOptionA", null);
      payload.optionB = promptOptionalText("quiz.promptOptionB", null);
      payload.optionC = promptOptionalText("quiz.promptOptionC", null);
      payload.optionD = promptOptionalText("quiz.promptOptionD", null);
      const answer = prompt(t("quiz.promptCorrectAnswer"), "A");
      const normalizedAnswer = (answer ?? "A").trim().toUpperCase();
      payload.correctAnswer = ["A", "B", "C", "D"].includes(normalizedAnswer)
        ? normalizedAnswer
        : "A";
    } else {
      payload.correctAnswer = confirm(t("quiz.confirmTrueFalse"))
        ? "true"
        : "false";
    }

    void onAddQuestion(payload);
  };

  const handleDeleteQuestion = (questionId: number) => {
    const confirmed = confirm(t("quiz.confirmDeleteQuestion"));
    if (!confirmed) {
      return;
    }

    void onDeleteQuestion(questionId);
  };

  const handleEditQuestion = (question: Question) => {
    const updatedText = prompt(
      t("quiz.promptEditQuestion"),
      question.question_text
    );
    if (updatedText === null) {
      return;
    }

    const payload: UpdateQuestionPayload = {
      questionText: updatedText.trim(),
    };

    if (!payload.questionText) {
      return;
    }

    if (question.type === "multiple") {
      const optionA = promptOptionalText(
        "quiz.promptOptionA",
        question.option_a
      );
      if (optionA !== undefined) {
        payload.optionA = optionA;
      }
      const optionB = promptOptionalText(
        "quiz.promptOptionB",
        question.option_b
      );
      if (optionB !== undefined) {
        payload.optionB = optionB;
      }
      const optionC = promptOptionalText(
        "quiz.promptOptionC",
        question.option_c
      );
      if (optionC !== undefined) {
        payload.optionC = optionC;
      }
      const optionD = promptOptionalText(
        "quiz.promptOptionD",
        question.option_d
      );
      if (optionD !== undefined) {
        payload.optionD = optionD;
      }
      const newCorrect = prompt(
        t("quiz.promptCorrectAnswer"),
        question.correct_answer
      );
      if (newCorrect !== null && newCorrect.trim() !== "") {
        const normalized = newCorrect.trim().toUpperCase();
        if (["A", "B", "C", "D"].includes(normalized)) {
          payload.correctAnswer = normalized;
        }
      }
    } else {
      const nextValue = prompt(
        t("quiz.promptTrueFalseAnswer"),
        question.correct_answer
      );
      if (nextValue !== null && nextValue.trim() !== "") {
        const normalized = nextValue.trim().toLowerCase();
        if (normalized === "true" || normalized === "false") {
          payload.correctAnswer = normalized;
        }
      }
    }

    const maybeTimeLimit = promptOptionalNumber(
      "quiz.promptTimeLimit",
      question.time_limit
    );
    if (maybeTimeLimit !== undefined) {
      payload.timeLimit = maybeTimeLimit;
    }

    const maybePoints = promptOptionalNumber(
      "quiz.promptPoints",
      question.points
    );
    if (maybePoints !== undefined) {
      payload.points = maybePoints;
    }

    void onUpdateQuestion(question.id, payload);
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8">
      <Container size="lg">
        {/* Header */}
        <Card className="p-6 sm:p-8 mb-6 animate-slide-down">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 text-light-700 hover:text-primary-600 transition-colors mb-4"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">{t("quiz.back")}</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">📝</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {quiz.title}
                </h2>
              </div>
              <p className="text-light-700 mb-4">{quiz.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold">
                  {questions.length}{" "}
                  {questions.length === 1
                    ? t("quiz.question")
                    : t("quiz.questionsPlural")}
                </span>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              onClick={handleAddQuestion}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              {t("quiz.addQuestion")}
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-dark-800 mb-2">
              {t("quiz.noQuestionsTitle")}
            </h3>
            <p className="text-light-700 mb-6">
              {t("quiz.noQuestionsDescription")}
            </p>
            <Button variant="primary" size="lg" onClick={handleAddQuestion}>
              {t("quiz.addFirstQuestion")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <Card
                key={q.id}
                className={`p-6 animate-slide-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="glass-effect rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-primary-600">
                        Q{index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-dark-800 flex-1">
                      {q.question_text}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(q)}
                    >
                      {t("quiz.editQuestion")}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      {t("quiz.deleteQuestion")}
                    </Button>
                  </div>
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2
                    ${
                      q.type === "multiple"
                        ? "bg-primary-100 text-primary-700 border border-primary-300"
                        : "bg-secondary-100 text-secondary-700 border border-secondary-300"
                    }
                  `}
                  >
                    {q.type === "multiple"
                      ? t("quiz.multipleChoiceShort")
                      : t("quiz.trueFalseShort")}
                  </span>
                </div>

                {/* Options for Multiple Choice */}
                {q.type === "multiple" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        letter: "A",
                        text: q.option_a,
                        className: "answer-option-a",
                      },
                      {
                        letter: "B",
                        text: q.option_b,
                        className: "answer-option-b",
                      },
                      {
                        letter: "C",
                        text: q.option_c,
                        className: "answer-option-c",
                      },
                      {
                        letter: "D",
                        text: q.option_d,
                        className: "answer-option-d",
                      },
                    ].map((option) => (
                      <div
                        key={option.letter}
                        className={`
                          p-3 rounded-xl transition-all
                          ${
                            q.correct_answer === option.letter
                              ? "bg-success-100 border-2 border-success-500 ring-2 ring-success-200"
                              : "bg-light-100 border-2 border-light-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-dark-700">
                            {option.letter}:
                          </span>
                          <span className="text-dark-800">{option.text}</span>
                          {q.correct_answer === option.letter && (
                            <span className="ml-auto text-success-600">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer for True/False */}
                {q.type === "truefalse" && (
                  <div className="mb-4">
                    <div className="glass-effect rounded-xl p-4 inline-flex items-center gap-2">
                      <span className="text-2xl">
                        {q.correct_answer === "true" ? "✓" : "✗"}
                      </span>
                      <span className="font-bold text-dark-800">
                        {t("quiz.correctAnswer")}:{" "}
                        {q.correct_answer === "true"
                          ? t("quiz.trueAnswer")
                          : t("quiz.falseAnswer")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Question Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="font-semibold text-dark-700">
                      {q.time_limit}s
                    </span>
                  </div>
                  <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
                    <span>🏆</span>
                    <span className="font-semibold text-dark-700">
                      {q.points} points
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
