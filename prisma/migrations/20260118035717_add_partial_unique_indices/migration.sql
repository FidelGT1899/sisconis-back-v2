-- DropIndex
DROP INDEX "users_dni_key";

-- DropIndex
DROP INDEX "users_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_email_active_key" ON "users"("email") WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_dni_active_key" ON "users"("dni") WHERE "deletedAt" IS NULL;
