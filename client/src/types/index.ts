// ─────────────────────────────────────────────────────────────────
// Domain types — single source of truth for all API shapes.
// Import from here, not from services/api.ts (deleted).
// ─────────────────────────────────────────────────────────────────

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalState = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
    id: string;
    email: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
    companyId: string;
}

/** Raw DTO as returned by the backend. Do NOT pass to UI components directly — use adapter. */
export interface Expense {
    id: string;
    /** Prisma Decimal serialises as a string in some environments. */
    amount: number | string;
    currency: string;
    category: string;
    status: ExpenseStatus;
    approvalState: ApprovalState;
    activeStepOrder: number | null;
    userId: string;
    companyId: string;
    createdAt: string;
    approvalSteps?: ApprovalStep[];
    user?: User;
}

export interface ApprovalStep {
    id: string;
    expenseId: string;
    stepOrder: number;
    approverRole: 'MANAGER' | 'ADMIN';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    actions: ApprovalAction[];
}

export interface ApprovalAction {
    id: string;
    stepId: string;
    actorUserId: string;
    action: 'APPROVE' | 'REJECT';
    comment?: string;
    createdAt: string;
    actor?: User;
}

export interface ApiError {
    errorCode: string;
    message: string;
    status: number;
    details?: unknown;
}
