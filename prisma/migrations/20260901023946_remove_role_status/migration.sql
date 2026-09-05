/*
  Warnings:

  - You are about to drop the column `status` on the `roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users"."roles" DROP COLUMN "status";

-- DropEnum
DROP TYPE "users"."RoleStatus";
