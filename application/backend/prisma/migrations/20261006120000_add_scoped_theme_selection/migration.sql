ALTER TABLE "organizations" ADD COLUMN "theme_id" TEXT;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_theme_id_check"
  CHECK ("theme_id" IS NULL OR "theme_id" IN ('cyber-arcade', 'solar-grid'));

ALTER TABLE "projects" ADD COLUMN "theme_id" TEXT;
ALTER TABLE "projects" ADD CONSTRAINT "projects_theme_id_check"
  CHECK ("theme_id" IS NULL OR "theme_id" IN ('cyber-arcade', 'solar-grid'));

ALTER TABLE "parties" ADD COLUMN "theme_id" TEXT;
ALTER TABLE "parties" ADD CONSTRAINT "parties_theme_id_check"
  CHECK ("theme_id" IS NULL OR "theme_id" IN ('cyber-arcade', 'solar-grid'));
