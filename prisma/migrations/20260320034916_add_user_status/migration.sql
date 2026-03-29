-- CreateEnum
CREATE TYPE "users"."UserStatus" AS ENUM ('SUSPENDED', 'ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "users"."role_level_idx";

-- AlterTable
ALTER TABLE "users"."users" ADD COLUMN     "status" "users"."UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "role_level_idx" ON "users"."roles"("deleted_at", "level");
