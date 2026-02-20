import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import CreateExpensePage from './pages/CreateExpensePage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';
import ApprovalsPage from './pages/ApprovalsPage';
import { ToastContainer } from './components/Toast';

function App() {
    return (
        <>
            <ToastContainer />
            <Routes>
                <Route path="/login" element={<AuthPage />} />

                {/* Protected Routes */}
                <Route element={<RequireAuth />}>
                    <Route element={<Layout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/expenses/new" element={<CreateExpensePage />} />
                        <Route path="/expenses/:id" element={<ExpenseDetailPage />} />

                        {/* Manager/Admin Only */}
                        <Route element={<RequireAuth allowedRoles={['MANAGER', 'ADMIN']} />}>
                            <Route path="/approvals" element={<ApprovalsPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
