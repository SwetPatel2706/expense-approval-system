import prisma from "../db.js";
import type { AuthContext } from "../auth.types.js";
import type { Expense } from "@prisma/client";
// unused imports removed


/**
 * Get all expenses waiting for the current user's approval.
 * Scoped by company and role.
 */
export async function getPendingApprovals(auth: AuthContext): Promise<Expense[]> {
    if (auth.role === "EMPLOYEE") {
        // Employees don't approve things
        return [];
    }

    // Find steps where:
    // 1. Approver role matches current user's role
    // 2. Step status is PENDING
    // 3. Expense is in IN_REVIEW state
    // 4. Expense active step matches this step's order (it is arguably redundant with status=PENDING but safer)
    // 5. Company matches
    // TODO: [PERF] Consider adding index on ApprovalStep(approverRole, status) for this query
    const pendingSteps = await prisma.approvalStep.findMany({
        where: {
            approverRole: auth.role,
            status: "PENDING",
            expense: {
                companyId: auth.companyId,
                approvalState: "IN_REVIEW",
                activeStepOrder: { not: null },
            },
        },
        include: {
            expense: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Filter out any where step order doesn't match active step (double check)
    // and deduplicate expenses if necessary (though strictly one pending step per expense per role usually)
    const expenses: Expense[] = [];
    for (const step of pendingSteps) {
        if (step.expense.activeStepOrder === step.stepOrder) {
            expenses.push(step.expense);
        }
    }

    return expenses;
}

/**
 * Get the full approval history (audit trail) for an expense.
 * Visible to:
 * - The expense owner (all roles)
 * - Admins (all expenses)
 * - Managers/Employees: only if they have/had an approval step on this expense
 *
 * NOTE: This overlaps with `expense-read.service.ts` getExpenseAuditTrail.
 * `getExpenseAuditTrail` is the canonical full-detail view for the expense page.
 * This function handles the specific "Approval History" view logic and access checking.
 */
export async function getApprovalHistory(
    expenseId: string,
    auth: AuthContext
) {
    // Role check: Employees cannot view approval history
    if (auth.role === "EMPLOYEE") {
        return null;
    }

    // First pass: check visibility using the same logic as expense-read.service
    // to ensure consistency and prevent unauthorized access
    // TODO: Optimize to single query if possible, but keep 2-step for strict visibility safety for now.
    const expense = await prisma.expense.findFirst({
        where: {
            id: expenseId,
            companyId: auth.companyId,
        },
        include: {
            approvalSteps: {
                where: {
                    approverRole: auth.role,
                },
                select: {
                    stepOrder: true,
                },
            },
        },
    });

    if (!expense) {
        return null;
    }

    // Access control: Owner? Admin? Or Manager/Admin with approval involvement?
    const isOwner = expense.userId === auth.userId;
    const isAdmin = auth.role === "ADMIN";
    const hasApprovalSteps = expense.approvalSteps.length > 0;

    if (!isOwner && !isAdmin && !hasApprovalSteps) {
        return null;
    }

    // Second pass: fetch full audit trail with all approval history
    return prisma.expense.findFirst({
        where: {
            id: expenseId,
            companyId: auth.companyId,
        },
        include: {
            approvalSteps: {
                orderBy: { stepOrder: "asc" },
                include: {
                    actions: {
                        orderBy: { createdAt: "asc" },
                        include: {
                            actor: {
                                select: { id: true, email: true, role: true }
                            }
                        }
                    }
                }
            }
        }
    });
}
