import type { AuthContext } from "../auth.types.js";
import type { ApprovalActionType } from "@prisma/client";

/**
 * Placeholder: act on an expense in the approval chain (approve or reject).
 * No logic implemented yet — anchors the API shape for Phase C2.
 */
export async function actOnExpenseApproval(
  expenseId: string,
  action: ApprovalActionType,
  comment: string | undefined,
  auth: AuthContext
): Promise<void> {
  void expenseId;
  void action;
  void comment;
  void auth;
  // TODO: implement in Phase C2
}
