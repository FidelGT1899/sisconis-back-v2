/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dni` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dni" TEXT NOT NULL,
ADD COLUMN     "isPasswordTemporary" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");
