import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense, Prisma } from "@prisma/client";
// unused imports removed


type ExpenseAuditTrail = Prisma.ExpenseGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        role: true;
      };
    };
    approvalSteps: {
      include: {
        actions: {
          include: {
            actor: {
              select: {
                id: true;
                email: true;
                role: true;
              };
            };
          };
        };
      };
    };
  };
}>;


/**
 * Get all expenses visible to the authenticated user.
 * 
 * Visibility rules:
 * - EMPLOYEE: own expenses only
 * - MANAGER: own expenses only
 * - ADMIN: all expenses in the company
 */
export async function listExpenses(auth: AuthContext): Promise<Expense[]> {
  const isScopedToOwnRecords = auth.role === "EMPLOYEE" || auth.role === "MANAGER";

  const whereClause: Prisma.ExpenseWhereInput = {
    companyId: auth.companyId,
    ...(isScopedToOwnRecords ? { userId: auth.userId } : {}),
  };

  // TODO: [PERF] Consider adding index on Expense(companyId, createdAt) for orderBy performance
  return prisma.expense.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
}

export async function getExpenseById(
  id: string,
  auth: AuthContext
): Promise<Expense | null> {
  if (auth.role === "ADMIN") {
    return prisma.expense.findFirst({
      where: {
        id,
        companyId: auth.companyId,
      },
    });
  }

  if (auth.role === "EMPLOYEE") {
    return prisma.expense.findFirst({
      where: {
        id,
        companyId: auth.companyId,
        userId: auth.userId,
      },
    });
  }

  if (auth.role !== "MANAGER") {
    return null;
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id,
      companyId: auth.companyId,
    },
    include: {
      approvalSteps: {
        where: {
          approverRole: auth.role,
        },
        select: {
          stepOrder: true,
          status: true,
        },
      },
    },
  });

  if (!expense) {
    return null;
  }

  const isOwner = expense.userId === auth.userId;
  // Manager can see if they own it OR have any approval step (pending or already acted on)
  const hasApprovalStep = expense.approvalSteps.length > 0;

  if (!isOwner && !hasApprovalStep) {
    return null;
  }

  const { approvalSteps: _approvalSteps, ...expenseData } = expense;

  return expenseData;
}

export async function getExpenseAuditTrail(
  id: string,
  auth: AuthContext
): Promise<ExpenseAuditTrail | null> {
  // Fetch with full audit trail data in a single query
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      companyId: auth.companyId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      approvalSteps: {
        orderBy: {
          stepOrder: "asc",
        },
        include: {
          actions: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              actor: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!expense) {
    return null;
  }

  // Apply visibility checks
  if (auth.role === "ADMIN") {
    return expense;
  }

  // Owner (EMPLOYEE or MANAGER) can see their own expenses
  const isOwner = expense.userId === auth.userId;
  if (isOwner) {
    return expense;
  }

  // MANAGER can see if they have an approval step
  if (auth.role === "MANAGER") {
    const hasApprovalStep = expense.approvalSteps.some(
      (step) => step.approverRole === auth.role
    );
    if (hasApprovalStep) {
      return expense;
    }
  }

  return null;
}
