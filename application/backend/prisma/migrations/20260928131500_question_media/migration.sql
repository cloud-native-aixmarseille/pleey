BEGIN;

ALTER TABLE "questions"
  ADD COLUMN "question_media_id" UUID;

ALTER TABLE "questions"
  ADD CONSTRAINT "questions_question_media_id_fkey"
  FOREIGN KEY ("question_media_id")
  REFERENCES "media"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE UNIQUE INDEX "questions_question_media_id_key" ON "questions"("question_media_id");

COMMIT;
