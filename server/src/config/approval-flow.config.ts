import { Expense } from "@prisma/client";

export interface ApprovalStepConfig {
    order: number;
    role: "MANAGER" | "ADMIN";
}

export function getApprovalSteps(expense: Expense): ApprovalStepConfig[] {
    return [
        { order: 1, role: "MANAGER" },
        { order: 2, role: "ADMIN" },
    ];
}
