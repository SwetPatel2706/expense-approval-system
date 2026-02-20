import type { Expense, ApprovalStep, ApprovalAction, ExpenseStatus, ApprovalState } from '../types';

// ─────────────────────────────────────────────────────────────────
// View Models — the ONLY shapes consumed by UI components.
// Pages must never access raw Expense DTO fields directly.
// ─────────────────────────────────────────────────────────────────

export interface ApprovalActionViewModel {
    id: string;
    action: 'APPROVE' | 'REJECT';
    comment: string | undefined;
    actorUserId: string;
    createdAtLabel: string;
}

export interface ApprovalStepViewModel {
    id: string;
    stepOrder: number;
    approverRole: 'MANAGER' | 'ADMIN';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    actions: ApprovalActionViewModel[];
}

export interface ExpenseViewModel {
    id: string;
    /** Pre-formatted with Intl.NumberFormat, e.g. "$1,500.00" */
    amountFormatted: string;
    /** Raw numeric value for arithmetic (e.g. dashboard totals) */
    amountRaw: number;
    currency: string;
    category: string;
    status: ExpenseStatus;
    approvalState: ApprovalState;
    /** email if available from joined user, otherwise "User <id>" */
    submitterLabel: string;
    /** First 2 characters of userId, uppercased — for avatar initials */
    submitterInitials: string;
    createdAtLabel: string;
    createdAtIso: string;
    /** Convenience flag: approvalState === 'DRAFT' */
    isDraft: boolean;
    approvalSteps: ApprovalStepViewModel[];
}

// ─────────────────────────────────────────────────────────────────
// Mapping helpers
// ─────────────────────────────────────────────────────────────────

function toApprovalActionViewModel(dto: ApprovalAction): ApprovalActionViewModel {
    return {
        id: dto.id,
        action: dto.action,
        comment: dto.comment,
        actorUserId: dto.actorUserId,
        createdAtLabel: new Date(dto.createdAt).toLocaleDateString(),
    };
}

function toApprovalStepViewModel(dto: ApprovalStep): ApprovalStepViewModel {
    return {
        id: dto.id,
        stepOrder: dto.stepOrder,
        approverRole: dto.approverRole,
        status: dto.status,
        actions: dto.actions.map(toApprovalActionViewModel),
    };
}

export function toExpenseViewModel(dto: Expense): ExpenseViewModel {
    const amountRaw = Number(dto.amount);

    // Use Intl.NumberFormat for locale-correct currency formatting
    const amountFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: dto.currency,
    }).format(amountRaw);

    return {
        id: dto.id,
        amountFormatted,
        amountRaw,
        currency: dto.currency,
        category: dto.category,
        status: dto.status,
        approvalState: dto.approvalState,
        submitterLabel: dto.user?.email ?? `User ${dto.userId}`,
        submitterInitials: dto.userId.substring(0, 2).toUpperCase(),
        createdAtLabel: new Date(dto.createdAt).toLocaleDateString(),
        createdAtIso: dto.createdAt,
        isDraft: dto.approvalState === 'DRAFT',
        approvalSteps: (dto.approvalSteps ?? []).map(toApprovalStepViewModel),
    };
}

export function toExpenseViewModelList(dtos: Expense[]): ExpenseViewModel[] {
    return dtos.map(toExpenseViewModel);
}
