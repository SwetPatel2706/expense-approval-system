import { Router } from "express";
import * as expensesController from "../controllers/expense.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAnyRole } from "../middlewares/auth.middleware.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

// List all expenses
router.get("/", expensesController.getExpenses);

// Get specific expense
router.get("/:id", expensesController.getExpenseById);

// Create expense
router.post(
    "/",
    requireAnyRole(["EMPLOYEE"]),
    validate(createExpenseSchema),
    expensesController.createExpense
);

// Submit expense
router.post(
    "/:id/submit",
    requireAnyRole(["EMPLOYEE"]),
    expensesController.submitExpense
);

export default router;
