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
import { requireAnyRole } from "../auth/require-role.js";

const router = Router();

router.post(
  "/",
  requireAnyRole(["MANAGER", "ADMIN"]),
  validate(createExpenseSchema), 
  asyncHandler(createExpense));
router.get("/", asyncHandler(getExpenses));
router.get("/:id", asyncHandler(getExpenseById));
router.put(
  "/:id",
  requireAnyRole(["MANAGER", "ADMIN"]),
  validate(updateExpenseSchema),
  asyncHandler(updateExpense)
);
router.delete(
  "/:id",
  requireAnyRole(["MANAGER", "ADMIN"]),
  asyncHandler(deleteExpense)
);

export default router;
