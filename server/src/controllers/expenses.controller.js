// server/src/controllers/expenses.controller.js
import prisma from '../db.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
} from '../schemas/expense.schema.js';

// GET /expenses
export async function getAllExpenses(req, res) {
  const expenses = await prisma.expense.findMany();
  res.json(expenses);
}

// GET /expenses/:id
export async function getExpenseById(req, res) {
  const { id } = req.params;

  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  res.json(expense);
}

// POST /expenses
export async function createExpense(req, res) {
    const parsed = createExpenseSchema.safeParse(req.body);
  
    if (!parsed.success) {
    //   console.log('❌ Zod validation failed');
    //   console.log('Request body:', req.body);
    //   console.log('Zod errors:', parsed.error.errors);
    //--------------------------------
  
      return res.status(400).json({
        message: 'Invalid request body',
    //   errors: parsed.error.errors,
    errors: parsed.error.issues,
      });
    }
  
    const { amount, currency, category, userId } = parsed.data;
  
    const expense = await prisma.expense.create({
      data: {
        amount,
        currency,
        category,
        userId,
        status: 'PENDING',
      },
    });
  
    res.status(201).json(expense);
  }  

// PUT /expenses/:id
export async function updateExpense(req, res) {
  const { id } = req.params;

  const parsed = updateExpenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid request body',
    //   errors: parsed.error.errors,
    errors: parsed.error.issues,

    });
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: parsed.data,
  });

  res.json(expense);
}

// DELETE /expenses/:id
export async function deleteExpense(req, res) {
  const { id } = req.params;

  await prisma.expense.delete({
    where: { id },
  });

  res.status(204).send();
}
