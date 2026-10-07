BEGIN;

-- Workspace selections are inherited defaults and may reference managed themes.
ALTER TABLE "organizations" RENAME COLUMN "theme_id" TO "default_theme_id";
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_theme_id_check";
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_default_theme_id_check"
  CHECK (
    "default_theme_id" IS NULL
    OR "default_theme_id" IN ('cyber-arcade', 'solar-grid')
    OR "default_theme_id" ~ '^custom:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE "projects" RENAME COLUMN "theme_id" TO "default_theme_id";
ALTER TABLE "projects" DROP CONSTRAINT "projects_theme_id_check";
ALTER TABLE "projects" ADD CONSTRAINT "projects_default_theme_id_check"
  CHECK (
    "default_theme_id" IS NULL
    OR "default_theme_id" IN ('cyber-arcade', 'solar-grid')
    OR "default_theme_id" ~ '^custom:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

CREATE TABLE "themes" (
  "id" UUID NOT NULL,
  "organization_id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "document" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "themes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "themes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "themes_organization_id_updated_at_id_idx" ON "themes"("organization_id", "updated_at", "id");

CREATE TABLE "theme_assets" (
  "id" UUID NOT NULL,
  "organization_id" UUID NOT NULL,
  "media_id" UUID NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "theme_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "theme_assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "theme_assets_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "theme_assets_media_id_key" ON "theme_assets"("media_id");
CREATE INDEX "theme_assets_organization_id_idx" ON "theme_assets"("organization_id");

-- Parties own document snapshots; absent legacy selections use the built-in theme.
ALTER TABLE "parties" ADD COLUMN "theme_document" JSONB;

UPDATE "parties"
SET "theme_document" = jsonb_build_object(
  'schemaVersion', 1,
  'baseThemeId', COALESCE("theme_id", 'cyber-arcade'),
  'name', CASE "theme_id" WHEN 'solar-grid' THEN 'Solar Grid' ELSE 'Cyber Arcade' END,
  'overrides', '{}'::jsonb
);

ALTER TABLE "parties" ALTER COLUMN "theme_document" SET NOT NULL;
ALTER TABLE "parties" ADD CONSTRAINT "parties_theme_document_check"
  CHECK (jsonb_typeof("theme_document") = 'object');
ALTER TABLE "parties" DROP CONSTRAINT "parties_theme_id_check";
ALTER TABLE "parties" DROP COLUMN "theme_id";

COMMIT;
