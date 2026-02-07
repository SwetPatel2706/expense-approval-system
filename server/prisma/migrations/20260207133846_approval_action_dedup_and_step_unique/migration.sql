/*
  Warnings:

  - You are about to drop the column `expenseId` on the `ApprovalAction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expenseId,stepOrder]` on the table `ApprovalStep` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ApprovalAction" DROP CONSTRAINT "ApprovalAction_expenseId_fkey";

-- DropIndex
DROP INDEX "ApprovalAction_expenseId_idx";

-- AlterTable
ALTER TABLE "ApprovalAction" DROP COLUMN "expenseId";

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalStep_expenseId_stepOrder_key" ON "ApprovalStep"("expenseId", "stepOrder");
