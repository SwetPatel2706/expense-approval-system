import { PrismaClient } from "@prisma/client";
import { startApprovalFlow, actOnExpenseApproval } from "../services/approval.service.js";
import { createExpense } from "../services/expenses.service.js";
import prisma from "../db.js";
import { AuthContext } from "../auth.types.js";

// Invariant:
// - status reflects final outcome (APPROVED / REJECTED)
// - approvalState reflects workflow progress

async function main() {
    console.log("🚀 Starting Approval Flow Verification");

    const companyId = "comp_" + Date.now();

    // 1. Setup Users
    console.log("Creating users...");
    const employee = await prisma.user.create({
        data: {
            email: `emp_${Date.now()}@test.com`,
            role: "EMPLOYEE",
            companyId,
        },
    });

    const manager = await prisma.user.create({
        data: {
            email: `mgr_${Date.now()}@test.com`,
            role: "MANAGER",
            companyId,
        },
    });

    const admin = await prisma.user.create({
        data: {
            email: `adm_${Date.now()}@test.com`,
            role: "ADMIN",
            companyId,
        },
    });

    const employeeAuth: AuthContext = { userId: employee.id, role: "EMPLOYEE", companyId };
    const managerAuth: AuthContext = { userId: manager.id, role: "MANAGER", companyId };
    const adminAuth: AuthContext = { userId: admin.id, role: "ADMIN", companyId };

    // 2. Create Expense
    console.log("Creating expense...");
    const expense = await createExpense({
        amount: 100,
        currency: "USD",
        category: "Travel"
    }, employeeAuth);

    if (!expense) throw new Error("Failed to create expense");
    console.log(`✅ Expense created: ${expense.id} (Status: ${expense.status}, Approval: ${expense.approvalState})`);

    // 3. Start Approval Flow
    console.log("Starting approval flow...");
    const inReviewExpense = await startApprovalFlow(expense.id, employeeAuth);

    if (inReviewExpense.approvalState !== "IN_REVIEW") throw new Error("Expense should be IN_REVIEW");
    if (inReviewExpense.activeStepOrder !== 1) throw new Error("Active step should be 1");
    console.log(`✅ Approval flow started. State: ${inReviewExpense.approvalState}`);

    // 4. Manager Approval
    console.log("Manager approving...");
    const afterManager = await actOnExpenseApproval(expense.id, "APPROVE", "Looks good", managerAuth);

    if (afterManager.activeStepOrder !== 2) throw new Error("Active step should be 2");
    console.log(`✅ Manager approved. Active step: ${afterManager.activeStepOrder}`);

    // 5. Admin Approval
    console.log("Admin approving...");
    const finalExpense = await actOnExpenseApproval(expense.id, "APPROVE", "Final check", adminAuth);

    if (finalExpense.approvalState !== "APPROVED") throw new Error("Expense should be APPROVED");
    if (finalExpense.activeStepOrder !== null) throw new Error("Active step should be null");
    console.log(`✅ Admin approved. Final State: ${finalExpense.approvalState}`);

    // 6. Test Rejection Path
    console.log("\nTesting Rejection Path...");
    const expense2 = await createExpense({
        amount: 50,
        currency: "USD",
        category: "Food"
    }, employeeAuth);
    if (!expense2) throw new Error("Failed to create expense 2");

    await startApprovalFlow(expense2.id, employeeAuth);
    const rejectedExpense = await actOnExpenseApproval(expense2.id, "REJECT", "No food allowed", managerAuth);

    if (rejectedExpense.approvalState !== "REJECTED") throw new Error("Expense should be REJECTED");
    console.log(`✅ Rejection verified. State: ${rejectedExpense.approvalState}`);

    console.log("\n🎉 All tests passed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
