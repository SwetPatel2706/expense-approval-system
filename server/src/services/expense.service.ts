import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense, Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";





/**
 * Create a new expense for the authenticated user.
 */
export async function createExpense(
  data: {
    amount: number;
    currency: string;
    category: string;
  },
  auth: AuthContext
): Promise<Expense | null> {
  return prisma.expense.create({
    data: {
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      userId: auth.userId,
      companyId: auth.companyId,
    },
  });
}

/**
 * Update an expense if it exists and is visible to the authenticated user.
 * Returns null if the expense is not visible.
 */
export async function updateExpense(
  id: string,
  data: Prisma.ExpenseUpdateInput,
  auth: AuthContext
): Promise<Expense | null> {
  // Authorization decision: determine access scope
  const isScopedToOwnRecords = auth.role === "EMPLOYEE" || auth.role === "MANAGER";
  const hasUnrestrictedAccess = auth.role === "ADMIN";

  if (!isScopedToOwnRecords && !hasUnrestrictedAccess) {
    throw new AppError(
      "Forbidden",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.AUTH_FORBIDDEN
    );
  }

  // Build where clause based on authorization decision
  const whereClause: Prisma.ExpenseWhereInput = {
    id,
    companyId: auth.companyId,
    ...(isScopedToOwnRecords ? { userId: auth.userId } : {}),
  };

  const result = await prisma.expense.updateMany({
    where: whereClause,
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.expense.findFirst({
    where: {
      id,
      companyId: auth.companyId,
    },
  });
}

/**
 * Delete an expense if it exists and is visible to the authenticated user.
 * Returns null if the expense is not visible.
 */
export async function deleteExpense(
  id: string,
  auth: AuthContext
): Promise<{ id: string } | null> {
  // Authorization decision: determine access scope
  const isScopedToOwnRecords = auth.role === "EMPLOYEE" || auth.role === "MANAGER";
  const hasUnrestrictedAccess = auth.role === "ADMIN";

  if (!isScopedToOwnRecords && !hasUnrestrictedAccess) {
    throw new AppError(
      "Forbidden",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.AUTH_FORBIDDEN
    );
  }

  // Build where clause based on authorization decision
  const whereClause: Prisma.ExpenseWhereInput = {
    id,
    companyId: auth.companyId,
    ...(isScopedToOwnRecords ? { userId: auth.userId } : {}),
  };

  const result = await prisma.expense.deleteMany({
    where: whereClause,
  });

  if (result.count === 0) {
    return null;
  }

  return { id };
}
