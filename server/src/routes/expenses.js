//server\src\routes\expenses.js

import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const expense = await prisma.expense.create({
      data: req.body,
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

// GET all expenses
router.get('/', async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

// GET expense by id
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    next(err);
  }
});

// UPDATE expense
router.put('/:id', async (req, res, next) => {
  try {
    const { amount, currency, category, status } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        amount,
        currency,
        category,
        status,
      },
    });

    res.json(expense);
  } catch (err) {
    next(err);
  }
});

// DELETE expense
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
