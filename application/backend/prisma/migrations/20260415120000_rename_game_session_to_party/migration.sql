ALTER TABLE "game_sessions" RENAME TO "parties";

ALTER TABLE "guests" RENAME COLUMN "session_id" TO "party_id";
ALTER TABLE "scores" RENAME COLUMN "session_id" TO "party_id";

ALTER INDEX "game_sessions_pin_key" RENAME TO "parties_pin_key";

ALTER TABLE "parties" RENAME CONSTRAINT "game_sessions_pkey" TO "parties_pkey";
ALTER TABLE "parties" RENAME CONSTRAINT "game_sessions_game_id_fkey" TO "parties_game_id_fkey";
ALTER TABLE "parties" RENAME CONSTRAINT "game_sessions_host_id_fkey" TO "parties_host_id_fkey";
ALTER TABLE "guests" RENAME CONSTRAINT "guests_session_id_fkey" TO "guests_party_id_fkey";
ALTER TABLE "scores" RENAME CONSTRAINT "scores_session_id_fkey" TO "scores_party_id_fkey";