import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (userId: string) => void;
    logout: () => void;
}

export const MOCK_USERS: Record<string, User> = {
    'user-1': { id: 'user-1', email: 'employee@example.com', role: 'EMPLOYEE', companyId: 'company-0001' },
    'user-2': { id: 'user-2', email: 'manager@example.com', role: 'MANAGER', companyId: 'company-0001' },
    'user-3': { id: 'user-3', email: 'admin@example.com', role: 'ADMIN', companyId: 'company-0001' },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: MOCK_USERS['user-1'], // Default to employee
            isAuthenticated: true,

            login: (userId: string) => {
                const user = MOCK_USERS[userId];
                if (user) {
                    set({ user, isAuthenticated: true });
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage', // key in localStorage
        }
    )
);
