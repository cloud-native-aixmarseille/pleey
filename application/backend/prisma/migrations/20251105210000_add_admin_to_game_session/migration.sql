-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN "admin_id" INTEGER;

-- Update existing records to set admin_id to the quiz creator
UPDATE "game_sessions" gs
SET "admin_id" = q."created_by"
FROM "quizzes" q
WHERE gs."quiz_id" = q."id";

-- Make admin_id NOT NULL after data migration
ALTER TABLE "game_sessions" ALTER COLUMN "admin_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
