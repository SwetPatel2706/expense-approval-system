import { useEffect, useState } from 'react';
import { approvalApi } from '../api/approval.api';
import { toExpenseViewModelList } from '../adapters/expense.adapter';
import type { ExpenseViewModel } from '../adapters/expense.adapter';

interface UsePendingApprovalsResult {
    pendingExpenses: ExpenseViewModel[];
    /** Set of expense IDs the current user is authorised to act on. O(1) lookup. */
    actionableIds: Set<string>;
    loading: boolean;
    error: string | null;
}

/**
 * Fetches /approvals/pending and exposes the result as view models plus
 * an O(1) actionableIds set.
 *
 * Contract: every ID in actionableIds is 100% server-authorised.
 * Components must use actionableIds.has(id) — not role, approvalState, or activeStep.
 *
 * Includes AbortController cleanup to prevent state updates on unmounted components.
 */
export function usePendingApprovals(): UsePendingApprovalsResult {
    const [pendingExpenses, setPendingExpenses] = useState<ExpenseViewModel[]>([]);
    const [actionableIds, setActionableIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPending = async () => {
            setLoading(true);
            setError(null);
            try {
                const dtos = await approvalApi.getPendingApprovals();
                if (controller.signal.aborted) return;
                const viewModels = toExpenseViewModelList(dtos);
                setPendingExpenses(viewModels);
                setActionableIds(new Set(dtos.map((e) => e.id)));
            } catch {
                if (controller.signal.aborted) return;
                setError('Failed to load pending approvals');
                // On error: empty set — fail safe: hide actions rather than assume eligibility
                setPendingExpenses([]);
                setActionableIds(new Set());
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchPending();

        return () => {
            controller.abort();
        };
    }, []);

    return { pendingExpenses, actionableIds, loading, error };
}
