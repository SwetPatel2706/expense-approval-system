// server/src/controllers/expenses.controller.ts

import { Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import * as expenseService from "../services/expenses.service.js";


/**
 * GET all expenses
*/
export async function getExpenses(req: Request, res: Response) {
  const expenses = await expenseService.getExpenses(req.auth);
  
  res.status(HTTP_STATUS.OK).json({
    data: expenses,
  });
}

/**
 * GET expense by id
*/
export async function getExpenseById(req: Request, res: Response) {
  const { id } = req.params;
  const expenseId = typeof id === "string" ? id : id[0];
  
  const expense = await expenseService.getExpenseById(expenseId, req.auth);
  
  if (!expense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }
  
  res.status(HTTP_STATUS.OK).json({
    data: expense,
  });
}

/**
 * CREATE expense
 */
export async function createExpense(req: Request, res: Response) {
  const { amount, currency, category } = req.body;

  try {
    const expense = await expenseService.createExpense(
      { amount, currency, category },
      req.auth
    );

    res.status(HTTP_STATUS.CREATED).json({
      data: expense,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      throw new AppError(
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.RESOURCE_NOT_FOUND
      );
    }
    throw error;
  }
}

/**
 * UPDATE expense
 */
export async function updateExpense(req: Request, res: Response) {
  const { id } = req.params;
  const expenseId = typeof id === "string" ? id : id[0];

  const updatedExpense = await expenseService.updateExpense(
    expenseId,
    req.body,
    req.auth
  );

  if (!updatedExpense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }

  res.status(HTTP_STATUS.OK).json({
    data: updatedExpense,
  });
}

/**
 * DELETE expense
 */
export async function deleteExpense(req: Request, res: Response) {
  const { id } = req.params;
  const expenseId = typeof id === "string" ? id : id[0];

  const result = await expenseService.deleteExpense(expenseId, req.auth);

  if (!result) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }

  res.status(HTTP_STATUS.OK).json({
    data: result,
  });
}
