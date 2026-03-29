-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateTable
CREATE TABLE "users"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_password_temporary" BOOLEAN NOT NULL DEFAULT true,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_by" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_active_key" ON "users"."users"("email") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_dni_active_key" ON "users"."users"("dni") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "user_email_unique_idx" ON "users"."users"("deleted_at", "email");

-- CreateIndex
CREATE INDEX "user_dni_unique_idx" ON "users"."users"("deleted_at", "dni");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "users"."users"("deleted_at", "role_id");

-- CreateIndex
CREATE INDEX "role_name_unique_idx" ON "users"."roles"("deleted_at", "name");

-- AddForeignKey
ALTER TABLE "users"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "users"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
