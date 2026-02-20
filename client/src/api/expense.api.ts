import { fetchClient } from './client';
import type { Expense } from '../types';

export interface CreateExpensePayload {
    amount: number;
    currency: string;
    category: string;
}

export const expenseApi = {
    getExpenses: (): Promise<Expense[]> =>
        fetchClient<Expense[]>('/expenses'),

    getExpenseById: (id: string): Promise<Expense> =>
        fetchClient<Expense>(`/expenses/${id}`),

    createExpense: (data: CreateExpensePayload): Promise<Expense> =>
        fetchClient<Expense>('/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    submitExpense: (id: string): Promise<Expense> =>
        fetchClient<Expense>(`/expenses/${id}/submit`, {
            method: 'POST',
        }),
};
