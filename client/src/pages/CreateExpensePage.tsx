import { useState } from 'react';
import { expenseApi } from '../api/expense.api';
import type { CreateExpensePayload } from '../api/expense.api';
import type { ApiError } from '../types';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import './CreateExpensePage.css';

export default function CreateExpensePage() {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Omit<CreateExpensePayload, 'amount'> & { amount: string }>({
        amount: '',
        currency: 'USD',
        category: 'Travel',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const categories = ['Travel', 'Meals', 'Software', 'Hardware', 'Office', 'Training'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount || Number(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.currency) {
            newErrors.currency = 'Currency is required';
        }
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await expenseApi.createExpense({
                amount: Number(formData.amount),
                currency: formData.currency,
                category: formData.category,
            });
            addToast('Expense created successfully', 'success');
            navigate('/expenses');
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            if (apiErr.status === 400) {
                addToast('Invalid expense data. Please check your inputs.', 'error');
            } else {
                addToast('Failed to create expense', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-expense-container">
            <header className="page-header">
                <h2 className="page-title">New Expense Request</h2>
                <p className="text-slate-500 mt-1">Submit a new expense for approval</p>
            </header>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    {/* Amount */}
                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <div className="input-group">
                            <span className="currency-addon">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input input-with-addon"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        {errors.amount && <p className="error-msg">{errors.amount}</p>}
                    </div>

                    {/* Currency */}
                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select
                            className="form-input"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/expenses')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
