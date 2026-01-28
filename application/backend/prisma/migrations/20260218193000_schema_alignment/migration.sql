-- Align existing databases created from the initial migration with the current Prisma schema.

-- 1) Add missing timestamp/soft-delete columns expected by Prisma models.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "game_sessions"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "guests"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "scores"
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "organization_members"
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "questions"
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "question_answers"
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "quizzes"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "games"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "project_id" INTEGER;

-- 2) Create missing tables introduced after the initial migration.
CREATE TABLE IF NOT EXISTS "projects" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "organization_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "predictions" (
  "id" SERIAL NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  "game_id" INTEGER NOT NULL,
  CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prediction_prompts" (
  "id" SERIAL NOT NULL,
  "prediction_id" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "prompt_text" TEXT NOT NULL,
  "time_limit" INTEGER NOT NULL DEFAULT 20,
  "points" INTEGER NOT NULL DEFAULT 1000,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "prediction_prompts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prediction_options" (
  "id" SERIAL NOT NULL,
  "prompt_id" INTEGER NOT NULL,
  "option_text" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "is_correct" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "prediction_options_pkey" PRIMARY KEY ("id")
);

-- 3) Backfill project relation for existing games that still reference organizations.
INSERT INTO "projects" ("name", "description", "organization_id", "created_at", "updated_at")
SELECT 'Default', 'Migrated default project', o."id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "organizations" o
WHERE NOT EXISTS (
  SELECT 1 FROM "projects" p WHERE p."organization_id" = o."id"
);

UPDATE "games" g
SET "project_id" = p."id"
FROM "projects" p
WHERE g."project_id" IS NULL
  AND g."organization_id" = p."organization_id";

ALTER TABLE "games"
  ALTER COLUMN "project_id" SET NOT NULL;

-- 4) Remove legacy columns that are no longer present in Prisma schema.
ALTER TABLE "quizzes"
  DROP COLUMN IF EXISTS "title",
  DROP COLUMN IF EXISTS "description";

ALTER TABLE "games"
  DROP COLUMN IF EXISTS "organization_id";

-- 5) Recreate and add FK constraints/indexes expected by current schema.
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_organization_id_fkey";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'games_project_id_fkey'
  ) THEN
    ALTER TABLE "games"
      ADD CONSTRAINT "games_project_id_fkey"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_organization_id_fkey'
  ) THEN
    ALTER TABLE "projects"
      ADD CONSTRAINT "projects_organization_id_fkey"
      FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'predictions_game_id_fkey'
  ) THEN
    ALTER TABLE "predictions"
      ADD CONSTRAINT "predictions_game_id_fkey"
      FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prediction_prompts_prediction_id_fkey'
  ) THEN
    ALTER TABLE "prediction_prompts"
      ADD CONSTRAINT "prediction_prompts_prediction_id_fkey"
      FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prediction_options_prompt_id_fkey'
  ) THEN
    ALTER TABLE "prediction_options"
      ADD CONSTRAINT "prediction_options_prompt_id_fkey"
      FOREIGN KEY ("prompt_id") REFERENCES "prediction_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "predictions_game_id_key" ON "predictions"("game_id");
CREATE UNIQUE INDEX IF NOT EXISTS "prediction_prompts_prediction_id_position_key" ON "prediction_prompts"("prediction_id", "position");
CREATE UNIQUE INDEX IF NOT EXISTS "prediction_options_prompt_id_position_key" ON "prediction_options"("prompt_id", "position");
