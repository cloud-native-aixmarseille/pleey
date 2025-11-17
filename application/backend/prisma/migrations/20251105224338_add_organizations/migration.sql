-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "organization_id" INTEGER;

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN "organization_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: Create a default organization for each admin user
INSERT INTO "organizations" ("name", "description", "created_at", "updated_at")
SELECT 
    u.username || '''s Organization',
    'Default organization for ' || u.username,
    NOW(),
    NOW()
FROM "users" u
WHERE u.is_admin = true;

-- Data migration: Add each admin as owner of their default organization
INSERT INTO "organization_members" ("organization_id", "user_id", "role", "joined_at")
SELECT 
    o.id,
    u.id,
    'owner',
    NOW()
FROM "users" u
INNER JOIN "organizations" o ON o.name = u.username || '''s Organization'
WHERE u.is_admin = true;

-- Data migration: Assign existing quizzes to the creator's default organization
UPDATE "quizzes" q
SET "organization_id" = om.organization_id
FROM "organization_members" om
WHERE q.created_by = om.user_id 
AND om.role = 'owner'
AND q.organization_id IS NULL;

-- Data migration: Assign existing game sessions to the admin's default organization
UPDATE "game_sessions" gs
SET "organization_id" = om.organization_id
FROM "organization_members" om
WHERE gs.admin_id = om.user_id 
AND om.role = 'owner'
AND gs.organization_id IS NULL;

-- Now make the organization_id columns required
ALTER TABLE "quizzes" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "game_sessions" ALTER COLUMN "organization_id" SET NOT NULL;
