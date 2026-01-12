// server/src/schemas/expense.schema.js
import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  category: z.string().min(1),
  userId: z.string().min(1),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});
