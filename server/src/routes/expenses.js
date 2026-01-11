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

export default router;
