import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { z } from "zod";
// FLAG: Naming inconsistency - `expensesService` (plural) vs `expenseReadService` (singular)
// Consider unifying to singular in a future refactor phase.
import * as expensesService from "../services/expense.service.js";
import * as expenseReadService from "../services/expense-read.service.js";
import * as approvalService from "../services/approval.service.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";

/**
 * GET /expenses
 * List all expenses visible to the current user.
 */
export const getExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const expenses = await expenseReadService.listExpenses(req.auth);
    res.status(HTTP_STATUS.OK).json(expenses);
  }
);

/**
 * GET /expenses/:id
 * Get a specific expense by ID.
 * Uses expense-read service to allow approvers to see expenses they don't own.
 */
export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const expense = await expenseReadService.getExpenseById(id as string, req.auth);

    if (!expense) {
      throw new AppError(
        "Expense not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.RESOURCE_NOT_FOUND
      );
    }

    res.status(HTTP_STATUS.OK).json(expense);
  }
);

/**
 * POST /expenses
 * Create a new expense.
 */
export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    // Validation handled by validate(createExpenseSchema) middleware
    type CreateExpenseBody = z.infer<typeof createExpenseSchema>;
    const { amount, currency, category } = req.body as CreateExpenseBody;

    const expense = await expensesService.createExpense(
      { amount, currency, category },
      req.auth
    );

    res.status(HTTP_STATUS.CREATED).json(expense);
  }
);

/**
 * POST /expenses/:id/submit
 * Submit an expense for approval.
 */
export const submitExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const expense = await approvalService.startApprovalFlow(id as string, req.auth);
    res.status(HTTP_STATUS.OK).json(expense);
  }
);
