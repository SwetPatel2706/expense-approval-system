import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import './Layout.css';

export const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    const toggleSidebar = () => setIsSidebarOpen((open) => !open);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}
            <main className="flex-1 p-8 ml-64 layout-main">
                <header className="layout-header">
                    <button
                        type="button"
                        className="layout-menu-button"
                        onClick={toggleSidebar}
                        aria-label="Toggle navigation"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="layout-header-title">
                        Hello, {user?.email.split('@')[0] ?? 'there'}
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};
