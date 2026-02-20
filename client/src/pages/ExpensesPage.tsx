import { useEffect, useState } from 'react';
import { expenseApi } from '../api/expense.api';
import { toExpenseViewModelList } from '../adapters/expense.adapter';
import type { ExpenseViewModel } from '../adapters/expense.adapter';
import type { ApiError } from '../types';
import { Loader } from '../components/Loader';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { useToastStore } from '../store/useToastStore';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import './ExpensesPage.css';

type FilterType = 'ALL' | 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseViewModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const dtos = await expenseApi.getExpenses();
            setExpenses(toExpenseViewModelList(dtos));
        } catch {
            addToast('Failed to load expenses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.MouseEvent, expense: ExpenseViewModel) => {
        e.preventDefault();
        e.stopPropagation();

        // isDraft is a cached field from adapter — backend enforces the real guard
        if (!expense.isDraft) return;

        try {
            await expenseApi.submitExpense(expense.id);
            addToast('Expense submitted for approval', 'success');
            loadExpenses();
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            if (apiErr.status === 409) {
                addToast('Expense already submitted. Refreshing...', 'error');
                loadExpenses();
            } else {
                addToast('Failed to submit expense', 'error');
            }
        }
    };

    const filteredExpenses = expenses.filter((expense) => {
        if (filter === 'ALL') return true;
        return expense.approvalState === filter;
    });

    const sortedExpenses = [...filteredExpenses].sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    );

    if (loading) return <Loader />;

    return (
        <div>
            <header className="expenses-header">
                <div className="title-area">
                    <h2>My Expenses</h2>
                    <p>Track and manage your reimbursement requests</p>
                </div>
                <Link
                    to="/expenses/new"
                    className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                    Create Expense
                </Link>
            </header>

            <div className="tabs-container">
                {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        className={clsx('tab-btn', filter === f && 'active')}
                        onClick={() => setFilter(f)}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {sortedExpenses.length === 0 ? (
                <EmptyState
                    title={filter === 'ALL' ? 'No expenses found' : `No ${filter.toLowerCase().replace('_', ' ')} expenses`}
                    description={filter === 'ALL' ? 'Create a new expense to get started.' : 'Try changing the filter or create a new expense.'}
                    action={
                        filter === 'ALL' && (
                            <Link to="/expenses/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">
                                Create Expense
                            </Link>
                        )
                    }
                />
            ) : (
                <div className="expenses-table-container">
                    <div className="overflow-x-auto">
                        <table className="expenses-table">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Approval State</th>
                                    <th>Created Date</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedExpenses.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/expenses/${expense.id}`)}
                                    >
                                        <td>
                                            <span className="amount-cell">{expense.amountFormatted}</span>
                                        </td>
                                        <td>
                                            <div className="category-cell">{expense.category}</div>
                                        </td>
                                        <td>
                                            <StatusBadge status={expense.isDraft ? 'DRAFT' : expense.status} />
                                        </td>
                                        <td>
                                            <StatusBadge status={expense.isDraft ? 'PENDING_SUBMISSION' : expense.approvalState} />
                                        </td>
                                        <td className="date-cell">{expense.createdAtLabel}</td>
                                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                            {expense.isDraft ? (
                                                <button
                                                    className="submit-btn"
                                                    onClick={(e) => handleSubmit(e, expense)}
                                                >
                                                    Submit
                                                </button>
                                            ) : (
                                                <button className="action-btn">
                                                    <span className="material-symbols-outlined">chevron_right</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
