import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";

/**
 * Act on an expense in the approval chain (approve or reject).
 * Expense must be IN_REVIEW; active step must be PENDING and approverRole must match auth.role.
 */
export async function actOnExpenseApproval(
  expenseId: string,
  action: "APPROVE" | "REJECT",
  comment: string | undefined,
  auth: AuthContext
): Promise<Expense | null> {
  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findFirst({
      where: { id: expenseId, companyId: auth.companyId },
      include: { approvalSteps: { orderBy: { stepOrder: "asc" } } },
    });

    if (!expense) {
      return null;
    }

    if (expense.approvalState !== "IN_REVIEW") {
      throw new AppError(
        "Expense is not in review",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    const activeOrder = expense.activeStepOrder;
    if (activeOrder == null) {
      throw new AppError(
        "No active approval step",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    const step = expense.approvalSteps.find((s) => s.stepOrder === activeOrder);
    if (!step) {
      throw new AppError(
        "Active approval step not found",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    if (step.status !== "PENDING") {
      throw new AppError(
        "Step already acted on",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    if (auth.role !== step.approverRole) {
      throw new AppError(
        "Forbidden",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.AUTH_FORBIDDEN
      );
    }

    await tx.approvalAction.create({
      data: {
        stepId: step.id,
        actorUserId: auth.userId,
        action,
        comment: comment ?? undefined,
      },
    });

    const newStepStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    await tx.approvalStep.update({
      where: { id: step.id },
      data: { status: newStepStatus },
    });

    if (action === "APPROVE") {
      const nextStep = expense.approvalSteps.find((s) => s.stepOrder === activeOrder + 1);
      if (nextStep) {
        await tx.expense.update({
          where: { id: expenseId },
          data: { activeStepOrder: activeOrder + 1 },
        });
      } else {
        await tx.expense.update({
          where: { id: expenseId },
          data: { approvalState: "APPROVED", activeStepOrder: null },
        });
      }
    } else {
      await tx.expense.update({
        where: { id: expenseId },
        data: { approvalState: "REJECTED", activeStepOrder: null },
      });
    }

    const updated = await tx.expense.findFirst({
      where: { id: expenseId, companyId: auth.companyId },
    });
    return updated ?? null;
  });
}

/**
 * Initialize a deterministic approval chain for an expense (MANAGER → ADMIN).
 * Expense must be DRAFT. Creates steps and sets expense to IN_REVIEW, activeStepOrder = 1.
 */
export async function initializeApprovalChain(
  expenseId: string,
  auth: AuthContext
): Promise<Expense | null> {
  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findFirst({
      where: { id: expenseId, companyId: auth.companyId },
    });

    if (!expense) {
      return null;
    }

    if (expense.approvalState !== "DRAFT") {
      throw new AppError(
        "Expense is not in draft",
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.RESOURCE_CONFLICT
      );
    }

    await tx.approvalStep.createMany({
      data: [
        { expenseId, stepOrder: 1, approverRole: "MANAGER" },
        { expenseId, stepOrder: 2, approverRole: "ADMIN" },
      ],
    });

    await tx.expense.update({
      where: { id: expenseId },
      data: { approvalState: "IN_REVIEW", activeStepOrder: 1 },
    });

    const updated = await tx.expense.findFirst({
      where: { id: expenseId, companyId: auth.companyId },
    });
    return updated ?? null;
  });
}
