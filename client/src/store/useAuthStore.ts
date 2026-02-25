import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    /** Derived from !!user — user object is the authoritative source of auth state, not token. */
    isAuthenticated: boolean;
    login: (userId: string) => void;
    logout: () => void;
}

export const MOCK_USERS: Record<string, User> = {
    'user-1': { id: 'user-1', email: 'employee@example.com', role: 'EMPLOYEE', companyId: 'company-0001' },
    'user-2': { id: 'user-2', email: 'manager@example.com', role: 'MANAGER', companyId: 'company-0001' },
    'user-3': { id: 'user-3', email: 'admin@example.com', role: 'ADMIN', companyId: 'company-0001' },
};

/**
 * In-memory auth store — no persistence.
 *
 * Token is a mock placeholder (e.g. "mock-token-user-1") to prepare for a real
 * JWT flow. isAuthenticated is driven by the presence of `user`, not `token`,
 * since token is not yet validated server-side via Authorization header.
 *
 * Refreshing the browser clears state → user is logged out. This is intentional.
 */
export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: (userId: string) => {
        const user = MOCK_USERS[userId];
        if (user) {
            set({
                user,
                token: `mock-token-${userId}`,
                isAuthenticated: true,
            });
        }
    },

    logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
