import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense, Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";

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

const FORBIDDEN_ERROR = new AppError(
  "Forbidden",
  HTTP_STATUS.FORBIDDEN,
  ERROR_CODE.AUTH_FORBIDDEN
);

export async function getMyExpenses(auth: AuthContext): Promise<Expense[]> {
  return prisma.expense.findMany({
    where: {
      companyId: auth.companyId,
      userId: auth.userId,
    },
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
    throw FORBIDDEN_ERROR;
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
          status: "PENDING",
        },
        select: {
          stepOrder: true,
        },
      },
    },
  });

  if (!expense) {
    return null;
  }

  const isOwner = expense.userId === auth.userId;
  const hasPendingApproval =
    expense.approvalState === "IN_REVIEW" &&
    expense.activeStepOrder !== null &&
    expense.approvalSteps.some(
      (step) => step.stepOrder === expense.activeStepOrder
    );

  if (!isOwner && !hasPendingApproval) {
    return null;
  }

  const { approvalSteps: _approvalSteps, ...expenseData } = expense;

  return expenseData;
}

export async function getPendingApprovals(
  auth: AuthContext
): Promise<Expense[]> {
  if (auth.role === "EMPLOYEE") {
    throw FORBIDDEN_ERROR;
  }

  const pendingSteps = await prisma.approvalStep.findMany({
    where: {
      approverRole: auth.role,
      status: "PENDING",
      expense: {
        companyId: auth.companyId,
        approvalState: "IN_REVIEW",
        activeStepOrder: { not: null },
      },
    },
    include: {
      expense: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const expensesById = new Map<string, Expense>();

  for (const step of pendingSteps) {
    if (step.expense.activeStepOrder !== step.stepOrder) {
      continue;
    }

    expensesById.set(step.expense.id, step.expense);
  }

  return Array.from(expensesById.values());
}

export async function getExpenseAuditTrail(
  id: string,
  auth: AuthContext
): Promise<ExpenseAuditTrail | null> {
  const visibleExpense = await getExpenseById(id, auth);

  if (!visibleExpense) {
    return null;
  }

  return prisma.expense.findFirst({
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
}
