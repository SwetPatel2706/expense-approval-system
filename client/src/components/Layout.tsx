import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
                {/* ml-64 matches sidebar-width 16rem */}
                <Outlet />
            </main>
        </div>
    );
};
