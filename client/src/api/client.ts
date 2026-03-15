import { useAuthStore } from '../store/useAuthStore';
import type { ApiError } from '../types';

export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized');
        this.name = 'UnauthorizedError';
    }
}

export async function fetchClient<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const { user, token } = useAuthStore.getState();

    if (!user) {
        throw {
            errorCode: 'UNAUTHENTICATED',
            message: 'User not authenticated',
            status: 401,
        } satisfies ApiError;
    }

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('x-user-id', user.id);
    headers.set('x-user-role', user.role);
    headers.set('x-company-id', user.companyId);

    const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
    const url = base ? `${base}${endpoint}` : endpoint;
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new UnauthorizedError();
    }
    const contentType = response.headers.get('Content-Type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const errorBody = (await response.json()) as Omit<ApiError, 'status'>;
            throw { ...errorBody, status: response.status } satisfies ApiError;
        }
        throw {
            errorCode: 'HTTP_ERROR',
            message: response.statusText || `HTTP ${response.status}`,
            status: response.status,
        } satisfies ApiError;
    }

    return (await response.json()) as T;
}
