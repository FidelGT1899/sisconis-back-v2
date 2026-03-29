/*
  Warnings:

  - You are about to drop the column `is_active` on the `roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `level` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "users"."RoleStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "users"."roles" DROP COLUMN "is_active",
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "status" "users"."RoleStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "roles_level_key" ON "users"."roles"("level");

-- CreateIndex
CREATE INDEX "role_level_idx" ON "users"."roles"("level");
