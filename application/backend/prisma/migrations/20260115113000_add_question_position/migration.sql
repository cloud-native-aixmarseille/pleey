-- Add question position and enforce per-quiz ordering uniqueness

ALTER TABLE "questions" ADD COLUMN "position" INTEGER;

UPDATE "questions" SET "position" = sub.position
FROM (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "quiz_id" ORDER BY id) - 1 AS position
  FROM "questions"
) AS sub
WHERE "questions"."id" = sub.id;

ALTER TABLE "questions" ALTER COLUMN "position" SET NOT NULL;

CREATE UNIQUE INDEX "questions_quiz_id_position_key" ON "questions"("quiz_id", "position");
