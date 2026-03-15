import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { expenseApi } from '../api/expense.api';
import { approvalApi } from '../api/approval.api';
import { toExpenseViewModelList } from '../adapters/expense.adapter';
import type { ExpenseViewModel } from '../adapters/expense.adapter';
import { Loader } from '../components/Loader';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { useToastStore } from '../store/useToastStore';
import './DashboardPage.css';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();
    const [expenses, setExpenses] = useState<ExpenseViewModel[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<ExpenseViewModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const controller = new AbortController();

        const loadData = async () => {
            try {
                // UX optimisation: skip the pending fetch for employees — backend would return []
                // This is NOT an authorisation decision; backend enforces access on every request.
                const isApprover = user.role === 'MANAGER' || user.role === 'ADMIN';

                const [myExpenses, approvals] = await Promise.all([
                    expenseApi.getExpenses(),
                    isApprover ? approvalApi.getPendingApprovals() : Promise.resolve([]),
                ]);

                if (controller.signal.aborted) return;

                setExpenses(toExpenseViewModelList(myExpenses));
                setPendingApprovals(toExpenseViewModelList(approvals));
            } catch {
                if (controller.signal.aborted) return;
                addToast('Failed to load dashboard data', 'error');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadData();
        return () => controller.abort();
    }, [user]);

    if (loading) return <Loader />;

    // Display-only stats computed from adapter view models
    const totalSubmitted = expenses.reduce((sum, e) => sum + e.amountRaw, 0);
    const inReviewCount = expenses.filter((e) => e.approvalState === 'IN_REVIEW').length;
    const approvedCount = expenses.filter((e) => e.approvalState === 'APPROVED').length;
    const rejectedCount = expenses.filter((e) => e.approvalState === 'REJECTED').length;

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.email.split('@')[0]}</p>
            </header>

            {/* Summary Cards */}
            <section className="dashboard-grid">
                <div className="summary-card">
                    <div className="card-header">
                        <span className="card-label">Total Submitted</span>
                        <span className="material-symbols-outlined card-icon icon-primary">payments</span>
                    </div>
                    <p className="card-value">${totalSubmitted.toLocaleString()}</p>
                </div>

                <div className="summary-card">
                    <div className="card-header">
                        <span className="card-label">In Review</span>
                        <span className="material-symbols-outlined card-icon icon-blue">visibility</span>
                    </div>
                    <p className="card-value">{inReviewCount}</p>
                </div>

                <div className="summary-card">
                    <div className="card-header">
                        <span className="card-label">Approved</span>
                        <span className="material-symbols-outlined card-icon icon-emerald">check_circle</span>
                    </div>
                    <p className="card-value">{approvedCount}</p>
                </div>

                <div className="summary-card">
                    <div className="card-header">
                        <span className="card-label">Rejected</span>
                        <span className="material-symbols-outlined card-icon icon-rose">cancel</span>
                    </div>
                    <p className="card-value">{rejectedCount}</p>
                </div>
            </section>

            {/* Pending Approvals (Manager/Admin only — gated by server) */}
            {pendingApprovals.length > 0 && (
                <section className="mb-8">
                    <div className="section-header">
                        <h3 className="section-title">Pending Your Approval</h3>
                        <Link to="/approvals" className="text-sm font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="recent-list">
                        {pendingApprovals.slice(0, 3).map((expense) => (
                            <div key={expense.id} className="recent-item">
                                <div className="item-left">
                                    <span className="item-amount">{expense.amountFormatted}</span>
                                    <span className="item-category">
                                        {expense.category} • by {expense.submitterLabel}
                                    </span>
                                </div>
                                <div className="item-right">
                                    <Link
                                        to={`/expenses/${expense.id}`}
                                        className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Review
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Expenses */}
            <section>
                <div className="section-header">
                    <h3 className="section-title">Recent Expenses</h3>
                    <Link to="/expenses" className="text-sm font-bold text-primary hover:underline">View All</Link>
                </div>

                {expenses.length === 0 ? (
                    <EmptyState
                        title="No expenses yet"
                        description="Create your first expense request to get started."
                        action={
                            <Link to="/expenses/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">
                                Create Expense
                            </Link>
                        }
                    />
                ) : (
                    <div className="recent-list">
                        {expenses.slice(0, 5).map((expense) => (
                            <button
                                key={expense.id}
                                type="button"
                                className="recent-item recent-item-button"
                                onClick={() => navigate(`/expenses/${expense.id}`)}
                            >
                                <div className="item-left">
                                    <span className="item-amount">{expense.amountFormatted}</span>
                                    <span className="item-category">{expense.category}</span>
                                </div>
                                <div className="item-right">
                                    <StatusBadge status={expense.approvalState} />
                                    <div className="item-date">{expense.createdAtLabel}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
