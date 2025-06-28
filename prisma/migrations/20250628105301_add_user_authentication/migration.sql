-- Add columns with default values
ALTER TABLE "User" ADD COLUMN "email" TEXT DEFAULT 'temp@example.com';
ALTER TABLE "User" ADD COLUMN "password" TEXT DEFAULT 'temp_password_hash';
ALTER TABLE "User" ADD COLUMN "username" TEXT DEFAULT 'temp_user';
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;

-- Update existing users with unique values
UPDATE "User" SET 
  "username" = 'user_' || id,
  "email" = 'user_' || id || '@example.com',
  "password" = '$2a$10$temp.hash.for.existing.users'
WHERE "username" = 'temp_user';

-- Make columns NOT NULL after updating
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Remove default values
ALTER TABLE "User" ALTER COLUMN "email" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "username" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");