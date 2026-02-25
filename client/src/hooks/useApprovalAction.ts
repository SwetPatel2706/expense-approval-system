import { useEffect, useState } from 'react';
import { approvalApi } from '../api/approval.api';
import { toExpenseViewModel } from '../adapters/expense.adapter';
import type { ExpenseViewModel } from '../adapters/expense.adapter';
import type { ApiError } from '../types';

export interface UseApprovalActionResult {
    act: (action: 'APPROVE' | 'REJECT', comment?: string) => Promise<ExpenseViewModel | null>;
    loading: boolean;
    conflict: boolean;
    error: string | null;
}

/**
 * Encapsulates a single approval action (APPROVE | REJECT) for the given expense.
 *
 * Design constraints:
 *  - Accepts null expenseId — returns a safe no-op when the expense hasn't loaded yet.
 *  - Resets conflict + error whenever expenseId changes (prevents stale state leaking
 *    across navigations from Expense A to Expense B).
 *  - 409 Conflict  → sets conflict = true, returns null (buttons should be disabled)
 *  - Other errors  → sets error message, returns null
 *  - On success    → returns mapped ExpenseViewModel; caller is responsible for updating UI.
 *  - No automatic refetch. No mutation of the pending approvals list.
 */
export function useApprovalAction(expenseId: string | null): UseApprovalActionResult {
    const [loading, setLoading] = useState(false);
    const [conflict, setConflict] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset transient state when navigating to a different expense
    useEffect(() => {
        setConflict(false);
        setError(null);
    }, [expenseId]);

    const act = async (
        action: 'APPROVE' | 'REJECT',
        comment?: string,
    ): Promise<ExpenseViewModel | null> => {
        // Guard: no-op if expenseId is not available yet
        if (!expenseId) return null;

        setLoading(true);
        setError(null);

        try {
            const dto = await approvalApi.actOnApproval(expenseId, {
                action,
                comment: comment?.trim() || undefined,
            });
            return toExpenseViewModel(dto);
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            if (apiErr.status === 409) {
                // Concurrent action: another user already acted on this expense
                setConflict(true);
            } else {
                setError(`Failed to ${action.toLowerCase()} expense`);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { act, loading, conflict, error };
}
