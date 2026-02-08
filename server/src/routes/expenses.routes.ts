import { Router } from "express";
import * as expensesController from "../controllers/expenses.controller.js";
import { validate } from "../middlewares/validate.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

// List all expenses
router.get("/", expensesController.getExpensesHandler);

// Get specific expense
router.get("/:id", expensesController.getExpenseByIdHandler);

// Create expense
router.post("/", validate(createExpenseSchema), expensesController.createExpenseHandler);

// Submit expense
router.post("/:id/submit", expensesController.submitExpenseHandler);

export default router;
