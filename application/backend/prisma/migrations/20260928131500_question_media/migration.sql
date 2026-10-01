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

CREATE TABLE "media_assets" (
  "id" UUID PRIMARY KEY,
  "object_key" TEXT NOT NULL UNIQUE,
  "uri" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "byte_size" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "duration_seconds" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "delete_after" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_assets_status_check" CHECK ("status" IN ('pending', 'ready', 'retired', 'deleting'))
);
CREATE INDEX "media_assets_status_delete_after_id_idx" ON "media_assets"("status", "delete_after", "id");
ALTER TABLE "questions" ADD COLUMN "media_asset_id" UUID;
CREATE UNIQUE INDEX "questions_media_asset_id_key" ON "questions"("media_asset_id");
ALTER TABLE "questions" ADD CONSTRAINT "questions_media_asset_id_fkey"
  FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
