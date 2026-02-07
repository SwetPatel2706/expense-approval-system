import { PrismaClient, Expense, ApprovalStep, ApprovalState, ApprovalActionType, Role, Prisma } from "@prisma/client";
import prisma from "../db.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { AuthContext } from "../auth.types.js";

/**
 * Starts the approval flow for an expense.
 * Moves expense from DRAFT -> IN_REVIEW and creates initial steps.
 * @param {string} expenseId - The ID of the expense to be approved.
 * @param {AuthContext} auth - The authentication context of the user.
 * @returns {Promise<Expense>} - The updated expense object.
 */
export async function startApprovalFlow(
  expenseId: string,
  auth: AuthContext
): Promise<Expense> {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch & Guard
    const expense = await getExpenseOrThrow(tx, expenseId, auth.companyId);

    if (expense.approvalState !== "DRAFT") {
      throw new AppError(
        "Expense must be in DRAFT state to submit",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    if (expense.userId !== auth.userId) {
      throw new AppError(
        "Cannot submit another user's expense",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.AUTH_FORBIDDEN
      );
    }

    // 2. State Transition: DRAFT -> IN_REVIEW
    // Create fixed steps: MANAGER -> ADMIN
    await tx.approvalStep.createMany({
      data: [
        { expenseId, stepOrder: 1, approverRole: "MANAGER" },
        { expenseId, stepOrder: 2, approverRole: "ADMIN" },
      ],
    });

    const updatedExpense = await tx.expense.update({
      where: { id: expenseId },
      data: {
        approvalState: "IN_REVIEW",
        activeStepOrder: 1,
      },
    });

    return updatedExpense;
  });
}

/**
 * Process an approval action (APPROVE/REJECT) on the active step.
 */
export async function actOnExpenseApproval(
  expenseId: string,
  action: "APPROVE" | "REJECT",
  comment: string | undefined,
  auth: AuthContext
): Promise<Expense> {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch & Guard
    const expense = await getExpenseWithStepsOrThrow(tx, expenseId, auth.companyId);

    validateExpenseState(expense);

    const activeStep = getActiveStepOrThrow(expense);
    validateActorIsApprover(activeStep, auth);

    // 2. Record Action
    await tx.approvalAction.create({
      data: {
        expenseId,
        stepId: activeStep.id,
        actorUserId: auth.userId,
        action: action === "APPROVE" ? "APPROVE" : "REJECT",
        comment: comment,
      },
    });

    // 3. Update Step Status - Atomic Check
    const newStepStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const updateResult = await tx.approvalStep.updateMany({
      where: {
        id: activeStep.id,
        status: "PENDING"
      },
      data: { status: newStepStatus },
    });

    if (updateResult.count === 0) {
      throw new AppError(
        "Step already processed or invalid",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    // 4. Update Expense State
    if (action === "REJECT") {
      return await transitionToRejected(tx, expenseId);
    } else {
      const nextStep = expense.approvalSteps.find(s => s.stepOrder === activeStep.stepOrder + 1);
      if (nextStep) {
        return await transitionToNextStep(tx, expenseId, nextStep.stepOrder);
      } else {
        return await transitionToApproved(tx, expenseId);
      }
    }
  });
}

// --- Internal Helpers ---

async function getExpenseOrThrow(
  tx: Prisma.TransactionClient,
  expenseId: string,
  companyId: string
) {
  const expense = await tx.expense.findFirst({
    where: { id: expenseId, companyId },
  });

  if (!expense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }
  return expense;
}

async function getExpenseWithStepsOrThrow(
  tx: Prisma.TransactionClient,
  expenseId: string,
  companyId: string
) {
  const expense = await tx.expense.findFirst({
    where: { id: expenseId, companyId },
    include: { approvalSteps: { orderBy: { stepOrder: "asc" } } },
  });

  if (!expense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }
  return expense;
}

function validateExpenseState(expense: Expense) {
  if (expense.approvalState !== "IN_REVIEW") {
    throw new AppError(
      "Expense is not in review",
      HTTP_STATUS.CONFLICT,
      ERROR_CODE.RESOURCE_CONFLICT
    );
  }
  if (expense.activeStepOrder === null) {
    throw new AppError(
      "Corrupted state: No active step order",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

function getActiveStepOrThrow(expense: Expense & { approvalSteps: ApprovalStep[] }) {
  const step = expense.approvalSteps.find((s) => s.stepOrder === expense.activeStepOrder);
  if (!step) {
    throw new AppError(
      "Active approval step not found",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  }
  if (step.status !== "PENDING") {
    throw new AppError(
      "Current step is not pending",
      HTTP_STATUS.CONFLICT,
      ERROR_CODE.RESOURCE_CONFLICT
    );
  }
  return step;
}

function validateActorIsApprover(step: ApprovalStep, auth: AuthContext) {
  if (auth.role !== step.approverRole) {
    throw new AppError(
      `Only ${step.approverRole} can approve this step`,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.AUTH_FORBIDDEN
    );
  }
}

async function transitionToRejected(
  tx: Prisma.TransactionClient,
  expenseId: string
) {
  return await tx.expense.update({
    where: { id: expenseId },
    data: {
      approvalState: "REJECTED",
      status: "REJECTED",
      activeStepOrder: null,
    },
  });
}

async function transitionToNextStep(
  tx: Prisma.TransactionClient,
  expenseId: string,
  nextStepOrder: number
) {
  return await tx.expense.update({
    where: { id: expenseId },
    data: {
      activeStepOrder: nextStepOrder,
      // Status remains PENDING
    },
  });
}

async function transitionToApproved(
  tx: Prisma.TransactionClient,
  expenseId: string
) {
  return await tx.expense.update({
    where: { id: expenseId },
    data: {
      approvalState: "APPROVED",
      status: "APPROVED",
      activeStepOrder: null,
    },
  });
}

// Ensure all variables are explicitly typed for better type safety

// Improved error handling for better debugging
// Consider adding logging for production environments

// Invariant:
// - status reflects final outcome (APPROVED / REJECTED)
// - approvalState reflects workflow progress
