import { Router } from "express";
import * as approvalsController from "../controllers/approval.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAnyRole } from "../middlewares/auth.middleware.js";
import { actOnApprovalSchema } from "../schemas/approval.schema.js";

const router = Router();

// List pending approvals
router.get("/pending", approvalsController.getPendingApprovals);

// Get approval history
router.get("/history/:expenseId", approvalsController.getApprovalHistory);

// Approve or Reject an expense
router.post(
    "/:expenseId/act",
    requireAnyRole(["MANAGER", "ADMIN"]),
    validate(actOnApprovalSchema),
    approvalsController.actOnApproval
);

export default router;
