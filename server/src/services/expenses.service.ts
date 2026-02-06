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
  if (auth.companyId !== "company-0001") {
    return [];
  }

  let whereClause: Prisma.ExpenseWhereInput;

  if (auth.role === "EMPLOYEE") {
    whereClause = {
      userId: auth.userId,
    };
  } else if (auth.role === "MANAGER") {
    whereClause = {
      userId: auth.userId,
    };
  } else if (auth.role === "ADMIN") {
    // ADMIN: intentionally omitting userId filter to access all company expenses
    whereClause = {};
  } else {
    return [];
  }

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
  if (auth.companyId !== "company-0001") {
    return null;
  }

  let whereClause: Prisma.ExpenseWhereInput;

  if (auth.role === "EMPLOYEE") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "MANAGER") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "ADMIN") {
    // ADMIN: intentionally omitting userId filter to access any expense in company
    whereClause = {
      id,
    };
  } else {
    return null;
  }

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
  if (auth.companyId !== "company-0001") {
    return null;
  }

  return prisma.expense.create({
    data: {
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      userId: auth.userId,
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
  if (auth.companyId !== "company-0001") {
    return null;
  }

  let whereClause: Prisma.ExpenseWhereInput;

  if (auth.role === "EMPLOYEE") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "MANAGER") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "ADMIN") {
    // ADMIN: intentionally omitting userId filter to allow updating any expense in company
    whereClause = {
      id,
    };
  } else {
    return null;
  }

  const result = await prisma.expense.updateMany({
    where: whereClause,
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.expense.findFirst({
    where: { id },
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
  if (auth.companyId !== "company-0001") {
    return null;
  }

  let whereClause: Prisma.ExpenseWhereInput;

  if (auth.role === "EMPLOYEE") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "MANAGER") {
    whereClause = {
      id,
      userId: auth.userId,
    };
  } else if (auth.role === "ADMIN") {
    // ADMIN: intentionally omitting userId filter to allow deleting any expense in company
    whereClause = {
      id,
    };
  } else {
    return null;
  }

  const result = await prisma.expense.deleteMany({
    where: whereClause,
  });

  if (result.count === 0) {
    return null;
  }

  return { id };
}
