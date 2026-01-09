-- Rename admin ownership to host ownership

-- Drop old FK (name depends on previous migration) and rename column
ALTER TABLE "game_sessions" RENAME COLUMN "admin_id" TO "host_id";

-- Rename the FK constraint if it exists (Postgres supports renaming constraints)
ALTER TABLE "game_sessions" RENAME CONSTRAINT "game_sessions_admin_id_fkey" TO "game_sessions_host_id_fkey";
