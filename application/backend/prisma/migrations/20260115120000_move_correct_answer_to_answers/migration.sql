-- Move correct answer flag onto question_answers

ALTER TABLE "question_answers" ADD COLUMN "is_correct" BOOLEAN NOT NULL DEFAULT false;

UPDATE "question_answers" qa
SET "is_correct" = true
FROM "questions" q
WHERE q."correct_answer_id" IS NOT NULL
  AND qa."id" = q."correct_answer_id";

ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_correct_answer_id_fkey";
DROP INDEX IF EXISTS "questions_correct_answer_id_key";
ALTER TABLE "questions" DROP COLUMN IF EXISTS "correct_answer_id";
