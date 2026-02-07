import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense, Prisma } from "@prisma/client";

/**
 * Get all expenses visible to the authenticated user based on their role.
 * 
 * Visibility rules:
 * - EMPLOYEE: own expenses only
 * - MANAGER: own expenses only
 * - ADMIN: all expenses in the company
 */
export async function getExpenses(auth: AuthContext): Promise<Expense[]> {
  // Authorization decision: determine access scope
  const isScopedToOwnRecords = auth.role === "EMPLOYEE" || auth.role === "MANAGER";
  const hasUnrestrictedAccess = auth.role === "ADMIN";

  if (!isScopedToOwnRecords && !hasUnrestrictedAccess) {
    return [];
  }

  // Build where clause based on authorization decision
  const whereClause: Prisma.ExpenseWhereInput = {
    companyId: auth.companyId,
    ...(isScopedToOwnRecords ? { userId: auth.userId } : {}),
  };

  return prisma.expense.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single expense by ID if visible to the authenticated user.
 * Returns null if the expense is not visible.
 * 
 * Visibility rules:
 * - EMPLOYEE: own expenses only
 * - MANAGER: own expenses only
 * - ADMIN: all expenses in the company
 */
export async function getExpenseById(
  id: string,
  auth: AuthContext
): Promise<Expense | null> {
  // Authorization decision: determine access scope
  const isScopedToOwnRecords = auth.role === "EMPLOYEE" || auth.role === "MANAGER";
  const hasUnrestrictedAccess = auth.role === "ADMIN";

  if (!isScopedToOwnRecords && !hasUnrestrictedAccess) {
    return null;
  }

  // Build where clause based on authorization decision
  const whereClause: Prisma.ExpenseWhereInput = {
    id,
    companyId: auth.companyId,
    ...(isScopedToOwnRecords ? { userId: auth.userId } : {}),
  };

  return prisma.expense.findFirst({
    where: whereClause,
  });
}

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
    return null;
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
    return null;
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
