// server/src/controllers/expenses.controller.ts

import { Request, Response } from "express";
import prisma from "../db.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";


/**
 * GET all expenses
*/
export async function getExpenses(_req: Request, res: Response) {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  res.status(HTTP_STATUS.OK).json({
    data: expenses,
  });
}

/**
 * GET expense by id
*/
export async function getExpenseById(req: Request, res: Response) {
  const { id } = req.params;
  
  const expense = await prisma.expense.findUnique({
    where: { id },
  });
  
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
  const userId = req.auth.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }

  const expense = await prisma.expense.create({
    data: {
      amount,
      currency,
      category,
      userId,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    data: expense,
  });
}
/**
 * UPDATE expense
 */
export async function updateExpense(req: Request, res: Response) {
  const { id } = req.params;

  const existingExpense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existingExpense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }

  const updatedExpense = await prisma.expense.update({
    where: { id },
    data: req.body,
  });

  res.status(HTTP_STATUS.OK).json({
    data: updatedExpense,
  });
}

/**
 * DELETE expense
 */
export async function deleteExpense(req: Request, res: Response) {
  const { id } = req.params;

  const existingExpense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existingExpense) {
    throw new AppError(
      "Expense not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.RESOURCE_NOT_FOUND
    );
  }

  await prisma.expense.delete({
    where: { id },
  });

  res.status(HTTP_STATUS.OK).json({
    data: { id },
  });
}
