-- Add soft-delete columns
ALTER TABLE "organizations" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "organization_members" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "quizzes" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "questions" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "game_sessions" ADD COLUMN "deleted_at" TIMESTAMP(3);
