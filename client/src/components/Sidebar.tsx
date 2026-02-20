import { NavLink } from 'react-router-dom';
import { useAuthStore, MOCK_USERS } from '../store/useAuthStore';
import clsx from 'clsx';
import './Sidebar.css';

export const Sidebar = () => {
    const { user, login } = useAuthStore();

    const handleSwitchUser = (userId: string) => {
        login(userId);
        window.location.reload(); // Simple reload to refresh app state entirely
    };

    if (!user) return null;

    const isManagerOrAdmin = user.role === 'MANAGER' || user.role === 'ADMIN';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand-icon">
                    <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="brand-text">
                    <h1>SaaS Corp</h1>
                    <p>Expense Portal</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                >
                    <span className="material-symbols-outlined icon">grid_view</span>
                    <span className="label">Dashboard</span>
                </NavLink>

                <NavLink
                    to="/expenses"
                    className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                >
                    <span className="material-symbols-outlined icon">receipt_long</span>
                    <span className="label">My Expenses</span>
                </NavLink>

                {isManagerOrAdmin && (
                    <NavLink
                        to="/approvals"
                        className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                    >
                        <span className="material-symbols-outlined icon">check_circle</span>
                        <span className="label">Approvals</span>
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    {/* Simple User Switcher Logic: Hover to reveal options */}
                    <div className="user-switcher">
                        {Object.values(MOCK_USERS).map((u) => (
                            <button
                                key={u.id}
                                className="switcher-item"
                                onClick={() => handleSwitchUser(u.id)}
                            >
                                {u.role} ({u.email})
                            </button>
                        ))}
                    </div>

                    <div className="user-avatar">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.email.split('@')[0]}</div>
                        <div className="user-role">{user.role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
