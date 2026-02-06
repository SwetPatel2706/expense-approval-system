-- AlterTable: Add companyId column to Expense (nullable first)
ALTER TABLE "Expense" ADD COLUMN "companyId" TEXT;

-- Backfill existing Expense records with default company
UPDATE "Expense" SET "companyId" = 'company-0001' WHERE "companyId" IS NULL;

-- Make companyId NOT NULL for Expense
ALTER TABLE "Expense" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable: Add companyId column to User (nullable first)
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

-- Backfill existing User records with default company
UPDATE "User" SET "companyId" = 'company-0001' WHERE "companyId" IS NULL;

-- Make companyId NOT NULL for User
ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Expense_companyId_userId_idx" ON "Expense"("companyId", "userId");

-- CreateIndex
CREATE INDEX "Expense_companyId_id_idx" ON "Expense"("companyId", "id");
