import { fetchClient } from './client';
import type { Expense } from '../types';

export interface ActOnApprovalPayload {
    action: 'APPROVE' | 'REJECT';
    comment?: string;
}

export const approvalApi = {
    /**
     * Returns expenses that are 100% actionable by the current user.
     * This is the ONLY authoritative source of action eligibility.
     */
    getPendingApprovals: (): Promise<Expense[]> =>
        fetchClient<Expense[]>('/approvals/pending'),

    /**
     * Returns the full expense with nested approval steps and actions.
     * Used by ExpenseDetailPage to render the timeline.
     */
    getApprovalHistory: (expenseId: string): Promise<Expense> =>
        fetchClient<Expense>(`/approvals/history/${expenseId}`),

    actOnApproval: (expenseId: string, data: ActOnApprovalPayload): Promise<Expense> =>
        fetchClient<Expense>(`/approvals/${expenseId}/act`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
