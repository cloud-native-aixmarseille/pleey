-- AlterTable
ALTER TABLE "games" ADD COLUMN     "allow_option_change_after_voting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "randomize_option_order" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "randomize_stage_order" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "password_hash" TEXT;
