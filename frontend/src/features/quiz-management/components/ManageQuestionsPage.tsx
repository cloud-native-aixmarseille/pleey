import { useNavigate } from "react-router-dom";
import { Quiz, Question } from "../../../shared/types";
import { Button, Card, Container } from "../../../shared/components";

interface ManageQuestionsPageProps {
  quiz: Quiz;
  questions: Question[];
  onAddQuestion: (questionData: Partial<Question>) => Promise<void>;
}

export default function ManageQuestionsPage({
  quiz,
  questions,
  onAddQuestion,
}: ManageQuestionsPageProps) {
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    const type = confirm("Type: OK = Choix multiple, Annuler = Vrai/Faux")
      ? "multiple"
      : "truefalse";
    const question_text = prompt("Question:");
    if (!question_text) return;

    const questionData: Partial<Question> & { quiz_id: number } = {
      quiz_id: quiz.id,
      question_text,
      type,
      time_limit: 20,
      points: 1000,
    };

    if (type === "multiple") {
      questionData.option_a = prompt("Option A:") ?? undefined;
      questionData.option_b = prompt("Option B:") ?? undefined;
      questionData.option_c = prompt("Option C:") ?? undefined;
      questionData.option_d = prompt("Option D:") ?? undefined;
      questionData.correct_answer =
        prompt("Réponse correcte (A/B/C/D):") ?? undefined;
    } else {
      questionData.correct_answer = confirm(
        "Réponse: OK = Vrai, Annuler = Faux"
      )
        ? "true"
        : "false";
    }

    onAddQuestion(questionData);
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
            <span className="font-semibold">Retour</span>
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
                  {questions.length} question{questions.length > 1 ? "s" : ""}
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
              Ajouter une question
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-dark-800 mb-2">
              Aucune question pour le moment
            </h3>
            <p className="text-light-700 mb-6">
              Commencez par ajouter votre première question !
            </p>
            <Button variant="primary" size="lg" onClick={handleAddQuestion}>
              Ajouter la première question
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
                    {q.type === "multiple" ? "QCM" : "Vrai/Faux"}
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
                        Réponse correcte:{" "}
                        {q.correct_answer === "true" ? "Vrai" : "Faux"}
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
