import { useState } from 'react';
import { useAuthStore, MOCK_USERS } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';

/** Typed shape for react-router location state */
interface LocationState {
    from?: { pathname: string };
}

export default function AuthPage() {
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedUser, setSelectedUser] = useState('user-1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(selectedUser);

        const state = location.state as LocationState | null;
        const from = state?.from?.pathname ?? '/';
        navigate(from, { replace: true });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>payments</span>
                    </div>
                    <h1 className="auth-title">ExpensePro</h1>
                    <p className="auth-subtitle">Sign in to access your workspace</p>
                </div>

                <div className="auth-body">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Select Mock Identity</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                <select
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                >
                                    {Object.values(MOCK_USERS).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.role} - {u.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit w-full flex items-center justify-center gap-2">
                            <span>Sign In</span>
                            <span className="material-symbols-outlined text-[18px]">login</span>
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    <div className="environment-badge">
                        <span className="material-symbols-outlined text-amber-500 text-[16px]">info</span>
                        <span>Mock Environment Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
