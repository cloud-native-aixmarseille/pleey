-- Add QuestionAnswer table and correct answer relation

CREATE TABLE "question_answers" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_value" TEXT NOT NULL,
    "answer_text" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "question_answers_question_id_answer_value_key" ON "question_answers"("question_id", "answer_value");

ALTER TABLE "questions" ADD COLUMN "correct_answer_id" INTEGER;

CREATE UNIQUE INDEX "questions_correct_answer_id_key" ON "questions"("correct_answer_id");

ALTER TABLE "questions" ADD CONSTRAINT "questions_correct_answer_id_fkey"
    FOREIGN KEY ("correct_answer_id") REFERENCES "question_answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
