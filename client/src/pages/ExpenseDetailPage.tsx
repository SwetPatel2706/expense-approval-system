import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { approvalApi } from '../api/approval.api';
import { expenseApi } from '../api/expense.api';
import { toExpenseViewModel } from '../adapters/expense.adapter';
import type { ExpenseViewModel, ApprovalActionViewModel } from '../adapters/expense.adapter';
import type { ApiError } from '../types';
import { usePendingApprovals } from '../hooks/usePendingApprovals';
import { useToastStore } from '../store/useToastStore';
import { Loader } from '../components/Loader';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import clsx from 'clsx';
import './ExpenseDetailPage.css';

export default function ExpenseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    const [expense, setExpense] = useState<ExpenseViewModel | null>(null);
    const [loading, setLoading] = useState(true);

    // Action Modal State
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);
    const [conflicted, setConflicted] = useState(false);

    // ✅ Authoritative source: server determines eligibility — no role/step inference
    const { actionableIds, loading: pendingLoading } = usePendingApprovals();

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const dto = await approvalApi.getApprovalHistory(id!);
            setExpense(toExpenseViewModel(dto));
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            if (apiErr.status === 404) {
                addToast('Expense not found', 'error');
                navigate('/expenses');
            } else if (apiErr.status === 403) {
                addToast('Access denied', 'error');
                navigate('/');
            } else {
                // Fallback to flat expense if history is unavailable
                try {
                    const dto = await expenseApi.getExpenseById(id!);
                    setExpense(toExpenseViewModel(dto));
                } catch {
                    addToast('Failed to load expense', 'error');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (type: 'APPROVE' | 'REJECT') => {
        setActionType(type);
        setShowModal(true);
        setComment('');
    };

    const submitAction = async () => {
        if (!expense || !actionType) return;

        setProcessing(true);
        try {
            await approvalApi.actOnApproval(expense.id, {
                action: actionType,
                comment: comment.trim() || undefined,
            });
            addToast(
                `Expense ${actionType === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
                'success',
            );
            setShowModal(false);
            await loadData();
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            if (apiErr.status === 409) {
                // Conflict: expense was already actioned (concurrent action or stale view)
                addToast(
                    'Action conflict: this expense was already actioned. Refreshing...',
                    'error',
                );
                setShowModal(false);
                setConflicted(true); // disable further actions until page is fresh
                await loadData();
            } else {
                addToast(`Failed to ${actionType.toLowerCase()} expense`, 'error');
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading || pendingLoading) return <Loader />;
    if (!expense) return <div>Expense not found</div>;

    // ✅ canAct is derived solely from server-returned pending list
    // No role check. No approvalState check. No activeStep check.
    const canAct = !conflicted && actionableIds.has(expense.id);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="detail-header">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Expense Details</h2>
                    <p className="text-slate-500">ID: {expense.id}</p>
                </div>
                <StatusBadge status={expense.approvalState} />
            </div>

            <div className="detail-grid">
                {/* Main Details */}
                <div className="detail-card">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <div className="detail-row">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value text-xl">{expense.amountFormatted}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Category</span>
                        <span className="detail-value">{expense.category}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Created By</span>
                        <span className="detail-value">{expense.submitterLabel}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Submitted On</span>
                        <span className="detail-value">{expense.createdAtLabel}</span>
                    </div>

                    {canAct && (
                        <div className="action-bar">
                            <button className="btn-reject" onClick={() => handleActionClick('REJECT')}>
                                Reject
                            </button>
                            <button className="btn-approve" onClick={() => handleActionClick('APPROVE')}>
                                Approve
                            </button>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="timeline-title">Approval Timeline</h3>
                    <div className="timeline-container relative">
                        <TimelineItem
                            role="Owner"
                            date={expense.createdAtLabel}
                            status="SUBMITTED"
                            isFirst
                            isCompleted={expense.approvalState !== 'DRAFT'}
                        />

                        {expense.approvalSteps.map((step) => (
                            <TimelineItem
                                key={step.id}
                                role={step.approverRole}
                                status={step.status}
                                actions={step.actions}
                                isCurrent={step.status === 'PENDING' && expense.approvalState === 'IN_REVIEW'}
                                isCompleted={step.status === 'APPROVED'}
                                isRejected={step.status === 'REJECTED'}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={actionType === 'APPROVE' ? 'Approve Expense' : 'Reject Expense'}
            >
                <div>
                    <p className="text-slate-600 mb-4">
                        {actionType === 'APPROVE'
                            ? 'Are you sure you want to approve this expense? It will move to the next stage.'
                            : 'Please provide a reason for rejecting this expense.'}
                    </p>

                    <textarea
                        className="w-full p-2 border border-slate-300 rounded mb-4"
                        rows={3}
                        placeholder={actionType === 'REJECT' ? 'Rejection reason (required)...' : 'Optional comment...'}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 text-slate-600 border border-slate-200 rounded hover:bg-slate-50"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className={clsx(
                                'px-4 py-2 text-white rounded font-bold',
                                actionType === 'APPROVE'
                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                    : 'bg-red-500 hover:bg-red-600',
                            )}
                            onClick={submitAction}
                            disabled={processing || (actionType === 'REJECT' && !comment.trim())}
                        >
                            {processing
                                ? 'Processing...'
                                : `Confirm ${actionType === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Timeline sub-component — display only, no business logic
// ─────────────────────────────────────────────────────────────────

interface TimelineItemProps {
    role: string;
    date?: string;
    status: string;
    actions?: ApprovalActionViewModel[];
    isFirst?: boolean;
    isCurrent?: boolean;
    isCompleted?: boolean;
    isRejected?: boolean;
}

function TimelineItem({ role, date, status, actions, isCurrent, isCompleted, isRejected }: TimelineItemProps) {
    const icon = isRejected ? 'cancel' : isCompleted ? 'check_circle' : isCurrent ? 'radio_button_unchecked' : 'circle';
    const latestAction = actions && actions.length > 0 ? actions[actions.length - 1] : null;

    return (
        <div className="timeline-item">
            <div className="timeline-line"></div>
            <div
                className={clsx(
                    'timeline-icon',
                    isCompleted && 'completed',
                    isCurrent && 'current',
                    isRejected && 'rejected',
                )}
            >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="timeline-content">
                <div className="timeline-header">
                    <span className="timeline-role">{role}</span>
                    <span className="timeline-date">{latestAction ? latestAction.createdAtLabel : date}</span>
                </div>
                <div className="timeline-status">
                    {isRejected ? 'Rejected' : isCompleted ? 'Approved' : isCurrent ? 'Pending Review' : status}
                </div>
                {latestAction?.comment && (
                    <div className="timeline-comment">"{latestAction.comment}"</div>
                )}
            </div>
        </div>
    );
}


