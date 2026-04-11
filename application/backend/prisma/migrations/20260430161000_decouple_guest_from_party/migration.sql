ALTER TABLE "guests" DROP CONSTRAINT IF EXISTS "guests_party_id_fkey";

ALTER TABLE "guests" DROP COLUMN IF EXISTS "party_id";