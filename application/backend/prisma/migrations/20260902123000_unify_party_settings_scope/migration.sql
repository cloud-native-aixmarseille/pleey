-- AlterTable
ALTER TABLE "organizations"
ADD COLUMN     "default_party_settings" JSONB;

-- AlterTable
ALTER TABLE "parties"
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "projects"
ADD COLUMN     "default_party_settings" JSONB;

-- Backfill existing parties from legacy game-owned settings.
UPDATE "parties" AS parties
SET "settings" = jsonb_build_object(
	'allowOptionChangeAfterVoting', games."allow_option_change_after_voting",
	'randomizeOptionOrder', games."randomize_option_order",
	'randomizeStageOrder', games."randomize_stage_order"
)
FROM "games" AS games
WHERE parties."game_id" = games."id"
	AND parties."settings" IS NULL;

UPDATE "parties" AS parties
SET "settings" = COALESCE(
	parties."settings",
	projects."default_party_settings",
	organizations."default_party_settings",
	jsonb_build_object(
		'allowOptionChangeAfterVoting', false,
		'randomizeOptionOrder', false,
		'randomizeStageOrder', false
	)
)
FROM "games" AS games
JOIN "projects" AS projects ON projects."id" = games."project_id"
JOIN "organizations" AS organizations ON organizations."id" = projects."organization_id"
WHERE parties."game_id" = games."id"
	AND parties."settings" IS NULL;

ALTER TABLE "parties"
ALTER COLUMN "settings" SET NOT NULL;

ALTER TABLE "games"
DROP COLUMN "allow_option_change_after_voting",
DROP COLUMN "randomize_option_order",
DROP COLUMN "randomize_stage_order";
