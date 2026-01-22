-- Allow guest scores by making user_id optional and storing guest identity
ALTER TABLE "scores" ADD COLUMN "guest_id" TEXT;
ALTER TABLE "scores" ADD COLUMN "guest_username" TEXT;
ALTER TABLE "scores" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "scores" ADD CONSTRAINT "scores_user_or_guest_check" CHECK (
  ("user_id" IS NOT NULL AND "guest_id" IS NULL)
  OR ("user_id" IS NULL AND "guest_id" IS NOT NULL)
);
