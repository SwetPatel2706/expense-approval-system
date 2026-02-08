import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import * as expensesService from "../services/expenses.service.js";
import * as expenseReadService from "../services/expense-read.service.js";
import * as approvalService from "../services/approval.service.js";

/**
 * GET /expenses
 * List all expenses visible to the current user.
 */
export const getExpensesHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const expenses = await expensesService.getExpenses(req.auth);
    res.status(HTTP_STATUS.OK).json(expenses);
  }
);

/**
 * GET /expenses/:id
 * Get a specific expense by ID.
 * Uses expense-read service to allow approvers to see expenses they don't own.
 */
export const getExpenseByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const expense = await expenseReadService.getExpenseById(id, req.auth);

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
export const createExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // Validation handled by validate(createExpenseSchema) middleware
    // req.body is now safe and typed (implicitly)
    const { amount, currency, category } = req.body;

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
export const submitExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const expense = await approvalService.startApprovalFlow(id, req.auth);
    res.status(HTTP_STATUS.OK).json(expense);
  }
);
