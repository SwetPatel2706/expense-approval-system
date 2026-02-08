import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import * as approvalService from "../services/approval.service.js";
import * as approvalReadService from "../services/approval-read.service.js";

/**
 * GET /approvals/pending
 * List all pending approvals for the current user (based on their role).
 */
export const getPendingApprovalsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const expenses = await approvalReadService.getPendingApprovals(req.auth);
        res.status(HTTP_STATUS.OK).json(expenses);
    }
);

/**
 * GET /approvals/history/:expenseId
 * Get the approval history for an expense.
 */
export const getApprovalHistoryHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { expenseId } = req.params;
        const expense = await approvalReadService.getApprovalHistory(expenseId as string, req.auth);

        if (!expense) {
            throw new AppError(
                "Expense not found or access denied",
                HTTP_STATUS.NOT_FOUND,
                ERROR_CODE.RESOURCE_NOT_FOUND
            );
        }

        res.status(HTTP_STATUS.OK).json(expense);
    }
);

/**
 * POST /approvals/:expenseId/act
 * Approve or Reject an expense.
 */
export const actOnApprovalHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { expenseId } = req.params;
        // Validation handled by validate(actOnApprovalSchema) middleware
        const { action, comment } = req.body;

        const updatedExpense = await approvalService.actOnExpenseApproval(
            expenseId as string,
            action,
            comment,
            req.auth
        );

        res.status(HTTP_STATUS.OK).json(updatedExpense);
    }
);
