import { useNavigate } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { usePendingApprovals } from '../hooks/usePendingApprovals';
import './ApprovalsPage.css';

export default function ApprovalsPage() {
    const navigate = useNavigate();
    // ✅ Single source of truth: pending approvals from server
    const { pendingExpenses, loading } = usePendingApprovals();

    if (loading) return <Loader />;

    return (
        <div>
            <header className="mb-6">
                <h2 className="text-3xl font-black text-slate-900">Pending Approvals</h2>
                <p className="text-slate-500 mt-1">Review and action expenses assigned to you</p>
            </header>

            {/* Search/Filter Bar */}
            <div className="section-filters">
                <div className="search-bar">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by User or Amount..."
                    />
                </div>
            </div>

            {pendingExpenses.length === 0 ? (
                <EmptyState
                    title="All caught up!"
                    description="You have no pending approvals at this time."
                    icon="check_circle"
                />
            ) : (
                <div className="approvals-table-container">
                    <table className="expenses-table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Submitted By</th>
                                <th>Current Status</th>
                                <th>Date</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingExpenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/expenses/${expense.id}`)}
                                >
                                    <td>
                                        <span className="amount-cell">{expense.amountFormatted}</span>
                                    </td>
                                    <td>
                                        <span className="font-medium text-slate-600">{expense.category}</span>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small">
                                                {expense.submitterInitials}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-details-name">{expense.submitterLabel}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={expense.approvalState} />
                                    </td>
                                    <td>
                                        <span className="text-sm text-slate-500">{expense.createdAtLabel}</span>
                                    </td>
                                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="review-btn"
                                            onClick={() => navigate(`/expenses/${expense.id}`)}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
