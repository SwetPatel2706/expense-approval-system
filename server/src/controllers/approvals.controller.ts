import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import * as expenseReadService from "../services/expense-read.service.js";
import * as approvalService from "../services/approval.service.js";

/**
 * GET /approvals/pending
 * List all pending approvals for the current user (based on their role).
 */
export const getPendingApprovalsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const expenses = await expenseReadService.getPendingApprovals(req.auth);
        res.status(HTTP_STATUS.OK).json(expenses);
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
            expenseId,
            action,
            comment,
            req.auth
        );

        res.status(HTTP_STATUS.OK).json(updatedExpense);
    }
);
