// server/src/routes/expenses.ts

import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "../controllers/expenses.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { validate } from "../middlewares/validate.js";
import { createExpenseSchema, updateExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

router.post(
  "/",
  validate(createExpenseSchema), 
  asyncHandler(createExpense));
router.get("/", asyncHandler(getExpenses));
router.get("/:id", asyncHandler(getExpenseById));
router.put("/:id", validate(updateExpenseSchema), asyncHandler(updateExpense));
router.delete("/:id", asyncHandler(deleteExpense));

export default router;
