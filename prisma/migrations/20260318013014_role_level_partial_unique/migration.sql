-- DropIndex
DROP INDEX "users"."roles_level_key";

-- CreateIndex
CREATE UNIQUE INDEX "role_level_active_key"
ON "users"."roles"("level")
WHERE "deleted_at" IS NULL;
